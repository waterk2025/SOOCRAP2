/**
 * 정기적 뉴스 수집 스크립트
 * 네이버 뉴스 API에서 모니터링 키워드로 뉴스를 수집하여 데이터베이스에 저장
 */

require('dotenv').config();
const { getNaverNews } = require('../services/naverNewsService');
const { analyzeSentiment } = require('../services/sentimentService');
const { sequelize } = require('../config/database');
const Article = require('../models/Article');
const MonitoringPolicy = require('../models/MonitoringPolicy');

// K-water 기본 키워드 (항상 수집되는 핵심 키워드)
const KWATER_BASE_KEYWORDS = [
  'K-water', 'Kwater', 'KWATER', 'kwater',
  '한국수자원공사', '수자원공사'
];

// 기존 호환성을 위한 모니터링 키워드 목록 (폴백용)
const MONITORING_KEYWORDS = [
  'kwater', 'Kwater', 'K-water', 'KWATER',
  '한국수자원공사', '수자원공사',
  '물관리', '수력발전', '댐', '수상태양광', '디지털플랫폼'
];

// URL 정규화 함수 (중복 체크 개선을 위해)
function normalizeUrl(url) {
  if (!url) return '';
  
  try {
    // URL 파라미터 제거 및 정규화
    const urlObj = new URL(url);
    return urlObj.origin + urlObj.pathname;
  } catch (error) {
    // URL 파싱 실패 시 원본 반환
    return url;
  }
}

// URL 필터링 함수
function filterExcludedUrls(newsData) {
  const excludedKeywords = [
    'allurekorea', 'beauty', 'fashion', 'cosmetic', 'makeup', 'skincare', '리그'
  ];
  
  return newsData.filter(item => {
    const url = (item.link || '').toLowerCase();
    const shouldExclude = excludedKeywords.some(keyword => 
      url.includes(keyword.toLowerCase())
    );
    
    if (shouldExclude) {
    }
    
    return !shouldExclude;
  });
}

// 고도화된 키워드 추출 함수
function extractKeywords(title, content, searchKeyword) {
  if (!title && !content) return [searchKeyword || '수자원'];
  
  const fullText = `${title || ''} ${content || ''}`.toLowerCase();
  
  // K-water 관련 핵심 키워드 목록 (카테고리별)
  const keywordCategories = {
    // 기업/기관명
    organization: [
      'k-water', 'kwater', '한국수자원공사', '수자원공사'
    ],
    // 수질 관련
    waterQuality: [
      '수질', '정수', '수돗물', '물맛', '수질개선', '정수처리', '수질검사', 
      '염소', '탁도', '수질오염', '정수장', '상수도'
    ],
    // 요금/서비스
    service: [
      '수도요금', '요금', '고지서', '납부', '과금', '자동납부', 
      '요금인상', '요금체계', '할인', '온라인결제'
    ],
    // 시설/인프라
    infrastructure: [
      '댐', '저수지', '수력발전', '수상태양광', '배관', '급수', 
      '상수관로', '정수시설', '취수장', '배수지'
    ],
    // 서비스 중단/복구
    maintenance: [
      '단수', '공사', '누수', '수리', '복구', '응급수리', 
      '급수차', '배관교체', '시설보수', '공급중단'
    ],
    // 고객 서비스
    customerService: [
      '고객센터', '상담', '민원', '불만', '응대', '콜센터', 
      '고객만족', '서비스품질', '친절도', '대기시간'
    ],
    // 환경/기술
    technology: [
      '스마트워터', '디지털플랫폼', '물관리', 'iot', '스마트미터', 
      '원격검침', '수자원관리', '친환경', '지속가능'
    ],
    // 재해/안전
    safety: [
      '가뭄', '홍수', '수해', '침수', '재해', '비상급수', 
      '안전관리', '수질사고', '응급대응'
    ]
  };
  
  const foundKeywords = [];
  const keywordCounts = {};
  
  // 검색 키워드 우선 추가
  if (searchKeyword) {
    foundKeywords.push(searchKeyword);
    keywordCounts[searchKeyword] = (fullText.match(new RegExp(searchKeyword.toLowerCase(), 'g')) || []).length;
  }
  
  // 각 카테고리별로 키워드 검색
  Object.keys(keywordCategories).forEach(category => {
    keywordCategories[category].forEach(keyword => {
      const regex = new RegExp(keyword.toLowerCase(), 'g');
      const matches = fullText.match(regex);
      
      if (matches && matches.length > 0) {
        if (!foundKeywords.includes(keyword)) {
          foundKeywords.push(keyword);
        }
        keywordCounts[keyword] = matches.length;
      }
    });
  });
  
  // 키워드가 없으면 기본 키워드 추가
  if (foundKeywords.length === 0) {
    foundKeywords.push(searchKeyword || '수자원');
    keywordCounts[searchKeyword || '수자원'] = 1;
  }
  
  // 언급 빈도가 높은 순으로 정렬 (최대 10개)
  const sortedKeywords = foundKeywords
    .sort((a, b) => (keywordCounts[b] || 0) - (keywordCounts[a] || 0))
    .slice(0, 10);
  
  return sortedKeywords;
}

// 키워드 중요도 분석 함수
function analyzeKeywordImportance(title, content, keywords) {
  const fullText = `${title || ''} ${content || ''}`.toLowerCase();
  const titleText = (title || '').toLowerCase();
  
  return keywords.map(keyword => {
    const keywordLower = keyword.toLowerCase();
    
    // 제목에 있으면 가중치 높음
    const inTitle = titleText.includes(keywordLower);
    
    // 전체 텍스트에서 언급 횟수
    const mentions = (fullText.match(new RegExp(keywordLower, 'g')) || []).length;
    
    // 중요도 점수 계산 (제목: 3점, 본문 언급: 1점씩)
    const importance = (inTitle ? 3 : 0) + mentions;
    
    return {
      keyword,
      mentions,
      inTitle,
      importance
    };
  }).sort((a, b) => b.importance - a.importance);
}

// 키워드 기반 감성분석 함수
function performKeywordBasedSentiment(text) {
  if (!text) return 'neutral';
  
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  
  // 긍정 키워드
  const POSITIVE_KEYWORDS = [
    '성공', '개선', '혁신', '발전', '증가', '상승', '긍정', '좋은', '훌륭한',
    '효과적', '효율적', '친환경', '지속가능', '안전', '신뢰', '투명',
    '혜택', '이익', '성과', '성취', '완료', '해결', '최적화', '우수',
    '수질개선', '정수', '깨끗한', '스마트', '첨단', '보존', '절약'
  ];
  
  // 부정 키워드
  const NEGATIVE_KEYWORDS = [
    '실패', '문제', '오류', '오작동', '중단', '지연', '손실', '피해',
    '부정', '나쁜', '악화', '감소', '하락', '위험', '불안', '우려',
    '비용', '손해', '폐기', '차단', '오염', '누출', '사고',
    '수질오염', '단수', '수질문제', '수도요금인상', '가뭄', '홍수', '침수'
  ];
  
  // 키워드 점수 계산
  POSITIVE_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      positiveScore += 1;
    }
  });
  
  NEGATIVE_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      negativeScore += 1;
    }
  });
  
  // 감성 판단
  if (positiveScore > negativeScore) {
    return 'positive';
  } else if (negativeScore > positiveScore) {
    return 'negative';
  } else {
    return 'neutral';
  }
}

// 정책별 뉴스 수집 및 저장 함수
async function collectAndSaveNews() {
  try {
    console.log('🚀 뉴스 수집 시작:', new Date().toISOString());
    
    // 1. 데이터베이스 연결 확인
    await sequelize.authenticate();
    console.log('✅ 데이터베이스 연결 확인');
    
    // 2. 활성화된 모니터링 정책 가져오기
    const activePolicies = await MonitoringPolicy.findAll({
      where: { status: 'active' },
      order: [['created_at', 'ASC']]
    });
    
    console.log(`📋 활성화된 정책: ${activePolicies.length}개`);
    
    if (activePolicies.length === 0) {
      console.log('⚠️ 활성화된 모니터링 정책이 없습니다. 기본 키워드로 수집합니다.');
      return await collectWithDefaultKeywords();
    }
    
    let allNewsData = [];
    let totalCollected = 0;
    
    // 3. K-water 기본 키워드 수집 (항상 실행)
    console.log(`\n🏢 K-water 기본 키워드 수집 중...`);
    console.log(`🔍 기본 키워드: [${KWATER_BASE_KEYWORDS.join(', ')}]`);
    
    for (let keywordIndex = 0; keywordIndex < KWATER_BASE_KEYWORDS.length; keywordIndex++) {
      const keyword = KWATER_BASE_KEYWORDS[keywordIndex];
      
      try {
        const newsData = await getNaverNews(keyword, 100, 1, 'date');
        
        const newsWithMetadata = newsData.map(item => ({
          ...item,
          searchKeyword: keyword,
          query: keyword,
          normalizedUrl: normalizeUrl(item.link),
          keywords: extractKeywords(item.title, item.description, keyword),
          policyId: null,
          policyName: 'K-water 기본 수집'
        }));
        
        allNewsData.push(...newsWithMetadata);
        totalCollected += newsData.length;
        
        // API 호출 제한을 위해 0.5초 대기
        if (keywordIndex < KWATER_BASE_KEYWORDS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        console.error(`❌ 기본 키워드 "${keyword}" 수집 실패`);
      }
    }

    // 4. 각 정책별로 뉴스 수집 (추가 키워드)
    for (let policyIndex = 0; policyIndex < activePolicies.length; policyIndex++) {
      const policy = activePolicies[policyIndex];
      
      // 정책의 키워드별로 뉴스 수집
      for (let keywordIndex = 0; keywordIndex < policy.keywords.length; keywordIndex++) {
        const keyword = policy.keywords[keywordIndex];
        
        try {
          const newsData = await getNaverNews(keyword, 100, 1, 'date');
          
          const newsWithMetadata = newsData.map(item => ({
            ...item,
            searchKeyword: keyword,
            query: keyword,
            normalizedUrl: normalizeUrl(item.link),
            keywords: extractKeywords(item.title, item.description, keyword),
            policyId: policy.id,
            policyName: policy.name
          }));
          
          allNewsData.push(...newsWithMetadata);
          totalCollected += newsData.length;
          
          // API 호출 제한을 위해 0.5초 대기
          if (keywordIndex < policy.keywords.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
        } catch (error) {
          console.error(`❌ 키워드 "${keyword}" 수집 실패`);
        }
      }
      
      // 정책 실행 정보 업데이트
      await policy.update({
        last_executed_at: new Date(),
        execution_count: policy.execution_count + 1
      });
      
      // 정책 간 대기 (API 제한 고려)
      if (policyIndex < activePolicies.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`📊 총 수집된 뉴스: ${totalCollected}개`);
    
    // 수집된 뉴스 처리 (중복 제거, 저장, 감성분석)
    return await processCollectedNews(allNewsData, totalCollected);
    
  } catch (error) {
    console.error('❌ 뉴스 수집 전체 실패:', error.message);
    throw error;
  }
}

// 기본 키워드로 뉴스 수집하는 폴백 함수 (정책이 없을 때)
async function collectWithDefaultKeywords() {
  console.log('🔄 K-water 기본 키워드로 뉴스 수집 시작... (정책 없음)');
  
  let allNewsData = [];
  let totalCollected = 0;
  
  // K-water 기본 키워드로 수집
  for (let i = 0; i < KWATER_BASE_KEYWORDS.length; i++) {
    const keyword = KWATER_BASE_KEYWORDS[i];
    
    try {
      const newsData = await getNaverNews(keyword, 100, 1, 'date');
      
      const newsWithMetadata = newsData.map(item => ({
        ...item,
        searchKeyword: keyword,
        query: keyword,
        normalizedUrl: normalizeUrl(item.link),
        keywords: extractKeywords(item.title, item.description, keyword),
        policyId: null,
        policyName: 'K-water 기본 수집'
      }));
      
      allNewsData.push(...newsWithMetadata);
      totalCollected += newsData.length;
      
      if (i < KWATER_BASE_KEYWORDS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.error(`❌ K-water 기본 키워드 "${keyword}" 수집 실패`);
    }
  }
  
  console.log(`📊 K-water 기본 키워드 총 수집: ${totalCollected}개`);
  
  // 나머지 처리는 동일
  return await processCollectedNews(allNewsData, totalCollected);
}

// 수집된 뉴스 처리 함수 (중복 제거, 저장, 감성분석)
async function processCollectedNews(allNewsData, totalCollected) {
  // URL 기반 중복 제거 (정규화된 URL 사용)
  const uniqueNewsData = [];
  const seenUrls = new Set();
  
  for (const item of allNewsData) {
    const normalizedUrl = item.normalizedUrl || normalizeUrl(item.link) || '';
    if (normalizedUrl && !seenUrls.has(normalizedUrl)) {
      seenUrls.add(normalizedUrl);
      uniqueNewsData.push(item);
    }
  }
  
  console.log(`🔄 URL 기반 중복 제거: ${allNewsData.length}개 → ${uniqueNewsData.length}개`);
  
  // URL 필터링
  const filteredNewsData = filterExcludedUrls(uniqueNewsData);
  console.log(`🚫 URL 필터링: ${uniqueNewsData.length}개 → ${filteredNewsData.length}개`);
  
  // 데이터베이스에 저장 (감성분석 포함)
  let savedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  
  console.log('💾 데이터베이스 저장 시작...');
  
  const newArticles = [];
  const existingArticles = [];
  
  // 모든 기사를 데이터베이스에 저장
  for (const newsItem of filteredNewsData) {
    try {
      // 키워드 중요도 분석
      const keywordAnalysis = analyzeKeywordImportance(
        newsItem.title, 
        newsItem.description, 
        newsItem.keywords || []
      );
      
      const [article, created] = await Article.findOrCreate({
        where: { url: newsItem.link },
        defaults: {
          title: newsItem.title || '',
          content: newsItem.description || '',
          url: newsItem.link || '',
          author: newsItem.author || '기자',
          source: '네이버뉴스',
          published_at: new Date(newsItem.pubDate || Date.now()),
          search_keyword: newsItem.searchKeyword || null,
          query: newsItem.query || null,
          unique_id: null, // URL 기반 중복 체크로 변경되어 더 이상 사용하지 않음
          keywords: newsItem.keywords || [],
          keyword_analysis: keywordAnalysis,
          sentiment: 'neutral',
          confidence: 0.5,
          ai_analyzed: false,
          policy_id: newsItem.policyId || null,
          policy_name: newsItem.policyName || null
        }
      });
      
      if (created) {
        newArticles.push(article);
        savedCount++;
      } else {
        // 기존 기사의 정책 정보 업데이트 (필요시)
        if (newsItem.policyId && !article.policy_id) {
          await article.update({
            policy_id: newsItem.policyId,
            policy_name: newsItem.policyName
          });
        }
        
        if (!article.sentiment || article.sentiment === 'neutral') {
          existingArticles.push(article);
        }
        updatedCount++;
      }
      
    } catch (itemError) {
      errorCount++;
    }
  }
  
  // 배치 감성분석 수행 (기존 코드와 동일)
  const articlesToAnalyze = [...newArticles, ...existingArticles];
  if (articlesToAnalyze.length > 0) {
    console.log(`\n🤖 배치 감성분석 시작: ${articlesToAnalyze.length}개 기사`);
    
    try {
      const analysisData = articlesToAnalyze.map(article => ({
        title: article.title || '',
        description: article.content || ''
      }));
      
      console.log('📊 감성분석 데이터 준비 완료:', analysisData.length, '개');
      
      const batchResult = await analyzeSentiment(analysisData, 'klue/bert-base');
      
      if (batchResult && batchResult.individual_results) {
        console.log(`✅ AI 감성분석 완료: ${batchResult.individual_results.length}개`);
        
        for (let i = 0; i < articlesToAnalyze.length; i++) {
          const article = articlesToAnalyze[i];
          const result = batchResult.individual_results[i];
          
          if (result && result.sentiment) {
            await article.update({
              sentiment: result.sentiment.toLowerCase(),
              confidence: result.confidence || 0.5,
              ai_analyzed: true,
              sentiment_scores: result.scores || null,
              model_used: result.model || 'klue/bert-base'
            });
          }
        }
      } else {
        throw new Error('배치 감성분석 결과가 없습니다.');
      }
      
    } catch (sentimentError) {
      console.error(`❌ 배치 감성분석 실패: ${sentimentError.message}`);
      console.log('🔑 키워드 기반 폴백으로 개별 처리...');
      
      for (const article of articlesToAnalyze) {
        const textToAnalyze = `${article.title || ''} ${article.content || ''}`.trim();
        const fallbackSentiment = performKeywordBasedSentiment(textToAnalyze);
        
        await article.update({
          sentiment: fallbackSentiment,
          confidence: 0.6,
          ai_analyzed: false,
          model_used: 'keyword_based'
        });
        
        // 키워드 기반 감성분석 완료
      }
    }
  }
  
  console.log('📊 뉴스 수집 완료:');
  console.log(`  - 새로 저장: ${savedCount}개`);
  console.log(`  - 기존 기사: ${updatedCount}개`);
  console.log(`  - 오류: ${errorCount}개`);
  console.log(`  - 완료 시간: ${new Date().toISOString()}`);
  
  return {
    success: true,
    collected: totalCollected,
    unique: filteredNewsData.length,
    saved: savedCount,
    updated: updatedCount,
    errors: errorCount
  };
}

// 스크립트 직접 실행 시
if (require.main === module) {
  collectAndSaveNews()
    .then(result => {
      console.log('🎉 뉴스 수집 성공:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 뉴스 수집 실패:', error.message);
      process.exit(1);
    });
}

module.exports = { collectAndSaveNews, MONITORING_KEYWORDS };
