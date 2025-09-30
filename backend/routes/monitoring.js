const express = require('express');
const router = express.Router();
const { getNaverNews } = require('../services/naverNewsService');
const { 
  analyzeSentiment, 
  analyzeAllExistingData, 
  getAvailableModels 
} = require('../services/sentimentService');

// 모니터링 키워드 목록
const MONITORING_KEYWORDS = [
  'kwater', 'Kwater', 'K-water', 'KWATER',
  '한국수자원공사', '수자원공사',
  '물관리', '수력발전', '댐', '수상태양광', '디지털플랫폼'
];

// 모든 언급 데이터 가져오기
router.get('/mentions', async (req, res) => {
  try {
    const { query, display = 100, start = 1, sort = 'date' } = req.query;
    
    let allNewsData = [];
    
    if (query) {
      // 특정 검색어가 있으면 해당 검색어로만 검색
      console.log(`🔍 특정 키워드 검색: ${query}`);
      const newsData = await getNaverNews(query, display, start, sort);
      allNewsData = newsData;
    } else {
      // 모든 모니터링 키워드를 개별 쿼리로 검색
      console.log(`🔍 ${MONITORING_KEYWORDS.length}개 키워드를 개별 쿼리로 검색 시작`);
      
      // 기존 저장된 데이터 로드
      let existingData = [];
      try {
        existingData = await loadExistingNewsData();
        console.log(`📚 기존 저장된 뉴스 데이터 ${existingData.length}개 로드 완료`);
      } catch (error) {
        console.log('📚 기존 저장된 데이터가 없습니다. 새로 시작합니다.');
      }
      
      // 순차적으로 키워드 검색 (초당 2건 이내로 제한)
      for (let i = 0; i < MONITORING_KEYWORDS.length; i++) {
        const keyword = MONITORING_KEYWORDS[i];
        try {
          console.log(`🔍 키워드 "${keyword}" 개별 쿼리 검색 중... (${i + 1}/${MONITORING_KEYWORDS.length})`);
          
          // 각 키워드를 개별 쿼리로 검색 (25개씩)
          const newsData = await getNaverNews(keyword, 25, 1, sort);
          
          // 키워드 정보 추가
          const newsWithKeyword = newsData.map(item => ({
            ...item,
            searchKeyword: keyword,
            query: keyword, // 개별 쿼리 정보 추가
            uniqueId: generateUniqueId(item) // 중복 제거를 위한 고유 ID 생성
          }));
          
          allNewsData.push(...newsWithKeyword);
          
          console.log(`✅ 키워드 "${keyword}" 개별 쿼리에서 ${newsData.length}개 뉴스 수집 완료`);
          
          // 초당 2건 이내로 제한하기 위해 0.5초 대기 (1000ms / 2 = 500ms)
          if (i < MONITORING_KEYWORDS.length - 1) {
            console.log(`⏳ 다음 키워드 검색까지 0.5초 대기... (초당 2건 이내)`);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
        } catch (error) {
          console.error(`❌ 키워드 "${keyword}" 개별 쿼리 검색 실패:`, error.message);
          // 에러가 발생해도 계속 진행
        }
      }
      
      // 중복 제거 (기존 데이터와 새 데이터 비교)
      const uniqueNewsData = removeDuplicates([...existingData, ...allNewsData]);
      console.log(`🔄 중복 제거: 기존 ${existingData.length}개 + 새로 ${allNewsData.length}개 → 고유 ${uniqueNewsData.length}개`);
      
      // ID 재할당 (연속적인 ID 부여)
      const reindexedNewsData = reassignIds(uniqueNewsData);
      console.log(`🆔 ID 재할당 완료: 1부터 ${reindexedNewsData.length}까지 연속 ID 부여`);
      
      // 특정 URL 패턴 제외 (예: allurekorea)
      const filteredNewsData = filterExcludedUrls(reindexedNewsData);
      console.log(`🚫 URL 필터링: ${reindexedNewsData.length}개 → ${filteredNewsData.length}개 (allurekorea 등 제외)`);
      
      // 모든 개별 쿼리 결과를 합쳐서 반환
      console.log(`✅ 총 ${filteredNewsData.length}개 뉴스 수집 완료 (중복 제거 + ID 재할당 + URL 필터링 후)`);
      
      // 데이터베이스에 저장 (중복 제거 + ID 재할당 + 필터링된 데이터)
      try {
        await saveNewsToDatabase(filteredNewsData);
        console.log('💾 중복 제거 + ID 재할당 + 필터링된 뉴스 데이터를 데이터베이스에 저장 완료');
      } catch (dbError) {
        console.error('⚠️ 데이터베이스 저장 실패 (계속 진행):', dbError.message);
      }
      
      // 최종 데이터를 allNewsData에 할당
      allNewsData = filteredNewsData;
    }
    
    // AI 기반 감성 분석 적용
    console.log('🤖 실시간 뉴스 데이터에 AI 감정분석 적용 시작...');
    const mentionsWithSentiment = await applyAISentimentAnalysis(allNewsData, query);
    
    res.json({
      success: true,
      data: mentionsWithSentiment,
      total: mentionsWithSentiment.length,
      query: query || '개별 키워드 쿼리 검색',
      keywords: query ? [query] : MONITORING_KEYWORDS,
      individualQueries: query ? null : MONITORING_KEYWORDS.map(keyword => ({
        keyword: keyword,
        count: allNewsData.filter(item => item.searchKeyword === keyword).length
      })),
      duplicateRemoved: query ? false : true,
      totalBeforeDedup: query ? allNewsData.length : 'N/A'
    });
    
  } catch (error) {
    console.error('❌ 모니터링 데이터 가져오기 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '모니터링 데이터를 가져오는 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 고유 ID 생성 함수 (중복 제거용)
function generateUniqueId(newsItem) {
  // 제목 + URL + 날짜를 조합하여 고유 ID 생성
  const title = newsItem.title || '';
  const url = newsItem.link || '';
  const date = newsItem.pubDate || '';
  
  // 간단한 해시 생성
  let hash = 0;
  const str = title + url + date;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  
  return Math.abs(hash).toString();
}

// 중복 제거 함수
function removeDuplicates(newsData) {
  const seen = new Set();
  const uniqueData = [];
  
  for (const item of newsData) {
    if (item.uniqueId && !seen.has(item.uniqueId)) {
      seen.add(item.uniqueId);
      uniqueData.push(item);
    }
  }
  
  return uniqueData;
}

// ID 재할당 함수 (연속적인 ID 부여)
function reassignIds(newsData) {
  const reindexedData = [];
  let currentId = 1;

  for (const item of newsData) {
    reindexedData.push({
      ...item,
      id: currentId++
    });
  }
  return reindexedData;
}

// 기존 저장된 뉴스 데이터 로드 함수
async function loadExistingNewsData() {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    
    // data 폴더가 없으면 빈 배열 반환
    try {
      await fs.access(dataDir);
    } catch {
      return [];
    }
    
    // 가장 최근 파일 찾기
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json')).sort().reverse();
    
    if (jsonFiles.length === 0) {
      return [];
    }
    
    const latestFile = jsonFiles[0];
    const filepath = path.join(dataDir, latestFile);
    
    const fileContent = await fs.readFile(filepath, 'utf8');
    const data = JSON.parse(fileContent);
    
    console.log(`📚 기존 데이터 파일 로드: ${latestFile}`);
    return Array.isArray(data) ? data : [];
    
  } catch (error) {
    console.error('⚠️ 기존 데이터 로드 실패:', error.message);
    return [];
  }
}

// 데이터베이스 저장 함수 (선택사항)
async function saveNewsToDatabase(newsData) {
  // 여기에 실제 데이터베이스 저장 로직을 구현할 수 있습니다
  // 예: MongoDB, PostgreSQL, SQLite 등
  
  // 현재는 파일 시스템에 JSON으로 저장하는 예시
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `news_data_${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'data', filename);
    
    // data 폴더가 없으면 생성
    const dataDir = path.dirname(filepath);
    await fs.mkdir(dataDir, { recursive: true });
    
    // 뉴스 데이터를 JSON 파일로 저장
    await fs.writeFile(filepath, JSON.stringify(newsData, null, 2), 'utf8');
    
    console.log(`💾 뉴스 데이터를 파일에 저장: ${filepath}`);
    return true;
  } catch (error) {
    console.error('❌ 파일 저장 실패:', error.message);
    throw error;
  }
}

// URL 필터링 함수 (예: allurekorea 등 제외)
function filterExcludedUrls(newsData) {
  // 제외할 키워드 목록 (URL에 이 키워드가 포함되면 제외)
  const excludedKeywords = [
    'allurekorea',
    'beauty',
    'fashion',
    'cosmetic',
    'makeup',
    'skincare',
    '리그'
  ];
  
  const filteredData = newsData.filter(item => {
    const url = (item.link || '').toLowerCase();
    
    // 제외 키워드가 URL에 포함되어 있는지 확인
    const shouldExclude = excludedKeywords.some(keyword => 
      url.includes(keyword.toLowerCase())
    );
    
    if (shouldExclude) {
      console.log(`🚫 제외된 URL: ${item.link} (키워드: ${excludedKeywords.find(k => url.includes(k.toLowerCase()))})`);
    }
    
    return !shouldExclude; // 제외 키워드가 없으면 포함
  });
  
  return filteredData;
}

// 키워드 추출 함수
function extractKeywords(content, searchKeyword) {
  if (!content) return [searchKeyword || '수자원'];
  
  // 기본 키워드 목록
  const baseKeywords = [
    '수자원', '물관리', '수력발전', '수상태양광', 
    '디지털플랫폼', 'Kwater', '한국수자원공사'
  ];
  
  // 검색 키워드가 있으면 추가
  const keywords = searchKeyword ? [searchKeyword, ...baseKeywords] : baseKeywords;
  
  // 내용에서 키워드가 포함된 것들만 필터링
  const foundKeywords = keywords.filter(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // 최소 1개는 반환
  return foundKeywords.length > 0 ? foundKeywords : [searchKeyword || '수자원'];
}

// 키워드 기반 감정분석 함수 (폴백용)
function fallbackSentimentAnalysis(text) {
  if (!text) return 'neutral';
  
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  
  // 긍정 키워드
  const POSITIVE_KEYWORDS = [
    '성공', '개선', '혁신', '발전', '증가', '상승', '긍정', '좋은', '훌륭한',
    '효과적', '효율적', '친환경', '지속가능', '안전', '신뢰', '투명',
    '혜택', '이익', '성과', '성취', '완료', '해결', '개선', '최적화'
  ];
  
  // 부정 키워드
  const NEGATIVE_KEYWORDS = [
    '실패', '문제', '오류', '오작동', '중단', '지연', '손실', '피해',
    '부정', '나쁜', '악화', '감소', '하락', '위험', '불안', '우려',
    '비용', '손해', '폐기', '중단', '차단', '오염', '누출', '사고'
  ];
  
  // 물 관련 긍정 키워드 (가중치 높음)
  const WATER_POSITIVE_KEYWORDS = [
    '수질개선', '정수', '깨끗한', '안전한', '신뢰할 수 있는',
    '효율적 관리', '스마트', '첨단', '혁신적', '친환경',
    '지속가능한', '보존', '절약', '재활용'
  ];
  
  // 물 관련 부정 키워드 (가중치 높음)
  const WATER_NEGATIVE_KEYWORDS = [
    '수질오염', '오염', '누출', '단수', '수질문제', '수도요금인상',
    '가뭄', '홍수', '침수', '수해', '수질사고', '정수장고장',
    '하수', '오수', '악취', '부영양화'
  ];
  
  // 긍정 키워드 체크
  POSITIVE_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) positiveScore += 1;
  });
  
  // 부정 키워드 체크
  NEGATIVE_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) negativeScore += 1;
  });
  
  // 물 관련 긍정 키워드 체크 (가중치 높음)
  WATER_POSITIVE_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) positiveScore += 2;
  });
  
  // 물 관련 부정 키워드 체크 (가중치 높음)
  WATER_NEGATIVE_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) negativeScore += 2;
  });
  
  // 감성 판단
  if (positiveScore > negativeScore) return 'positive';
  else if (negativeScore > positiveScore) return 'negative';
  else return 'neutral';
}

// AI 기반 실시간 감정분석 함수
async function applyAISentimentAnalysis(newsData, query) {
  try {
    console.log(`🤖 AI 감정분석 시작: ${newsData.length}개 뉴스 데이터`);
    
    if (newsData.length === 0) {
      return [];
    }
    
    // AI 감정분석 실행 (빠른 처리를 위해 적은 수의 데이터만)
    const limitedData = newsData.slice(0, 10); // 처음 10개만 AI 분석
    console.log(`⚡ 성능 최적화: ${limitedData.length}개 데이터만 AI 분석 적용`);
    
    let aiResults = null;
    try {
      // AI 감정분석 실행
      aiResults = await analyzeSentiment(limitedData, 'klue/bert-base');
      console.log('✅ AI 감정분석 성공');
    } catch (aiError) {
      console.error('❌ AI 감정분석 실패, 키워드 기반으로 폴백:', aiError.message);
    }
    
    // 결과 매핑
    const results = newsData.map((item, index) => {
      let sentiment = 'neutral';
      let confidence = 0.5;
      let aiAnalyzed = false;
      
      // AI 분석 결과가 있고, 해당 인덱스의 결과가 있으면 사용
      if (aiResults && aiResults.individual_results && index < aiResults.individual_results.length) {
        const aiResult = aiResults.individual_results[index];
        if (aiResult && aiResult.sentiment) {
          sentiment = aiResult.sentiment.toLowerCase();
          confidence = aiResult.confidence || 0.5;
          aiAnalyzed = true;
          console.log(`🎯 AI 분석 결과 적용 [${index}]: ${sentiment} (${(confidence * 100).toFixed(1)}%)`);
        }
      }
      
      // AI 분석 결과가 없으면 키워드 기반 폴백
      if (!aiAnalyzed) {
        sentiment = fallbackSentimentAnalysis(item.description);
        console.log(`🔄 키워드 기반 폴백 [${index}]: ${sentiment}`);
      }
      
      return {
        id: item.id,
        title: item.title,
        content: item.description,
        sentiment: sentiment,
        confidence: confidence,
        aiAnalyzed: aiAnalyzed,
        source: '네이버 뉴스',
        author: item.author || '기자',
        timestamp: item.pubDate,
        url: item.link,
        keywords: extractKeywords(item.description, item.searchKeyword || query),
        query: item.query || query,
        uniqueId: item.uniqueId
      };
    });
    
    // 감정 분포 통계
    const sentimentStats = results.reduce((acc, item) => {
      acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 실시간 감정분석 결과 통계:', sentimentStats);
    console.log(`🤖 AI 분석: ${results.filter(r => r.aiAnalyzed).length}개`);
    console.log(`🔑 키워드 분석: ${results.filter(r => !r.aiAnalyzed).length}개`);
    
    return results;
    
  } catch (error) {
    console.error('❌ 실시간 감정분석 전체 실패:', error.message);
    
    // 완전 실패 시 키워드 기반으로만 처리
    return newsData.map(item => ({
      id: item.id,
      title: item.title,
      content: item.description,
      sentiment: fallbackSentimentAnalysis(item.description),
      confidence: 0.5,
      aiAnalyzed: false,
      source: '네이버 뉴스',
      author: item.author || '기자',
      timestamp: item.pubDate,
      url: item.link,
      keywords: extractKeywords(item.description, item.searchKeyword || query),
      query: item.query || query,
      uniqueId: item.uniqueId
    }));
  }
}

// 고도화된 감정분석 API 엔드포인트들

// 사용 가능한 감정분석 모델 정보 조회
router.get('/sentiment/models', async (req, res) => {
  try {
    const models = getAvailableModels();
    res.json({
      success: true,
      models: models,
      total: Object.keys(models).length
    });
  } catch (error) {
    console.error('❌ 모델 정보 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '모델 정보를 가져오는 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 기존 저장된 데이터 전체 감정분석
router.post('/sentiment/analyze-all', async (req, res) => {
  try {
    const { model_name = 'klue/bert-base' } = req.body;
    
    console.log(`🔍 전체 데이터 감정분석 시작 (모델: ${model_name})`);
    
    const result = await analyzeAllExistingData(model_name);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('❌ 전체 데이터 감정분석 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '전체 데이터 감정분석 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 특정 텍스트 감정분석
router.post('/sentiment/analyze-text', async (req, res) => {
  try {
    const { text, model_name = 'klue/bert-base' } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: '분석할 텍스트를 입력해주세요.'
      });
    }
    
    console.log(`🔍 텍스트 감정분석 시작: "${text.substring(0, 50)}..." (모델: ${model_name})`);
    
    const result = await analyzeSentiment(text, model_name);
    
    res.json({
      success: true,
      text: text,
      ...result
    });
    
  } catch (error) {
    console.error('❌ 텍스트 감정분석 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '텍스트 감정분석 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 감정분석 결과 통계 조회
router.get('/sentiment/stats', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const dataDir = path.join(__dirname, '..', 'data');
    
    // data 폴더가 없으면 빈 통계 반환
    try {
      await fs.access(dataDir);
    } catch {
      return res.json({
        success: true,
        stats: {
          total_news_files: 0,
          total_sentiment_files: 0,
          latest_analysis: null,
          sentiment_distribution: { positive: 0, negative: 0, neutral: 0 }
        }
      });
    }
    
    // 파일 목록 조회
    const files = await fs.readdir(dataDir);
    const newsFiles = files.filter(file => file.startsWith('news_data_') && file.endsWith('.json'));
    const sentimentFiles = files.filter(file => file.startsWith('sentiment_analysis_') && file.endsWith('.json'));
    
    let latestAnalysis = null;
    let sentimentDistribution = { positive: 0, negative: 0, neutral: 0 };
    
    // 최신 감정분석 결과 로드
    if (sentimentFiles.length > 0) {
      const latestSentimentFile = sentimentFiles.sort().reverse()[0];
      const sentimentFilePath = path.join(dataDir, latestSentimentFile);
      
      try {
        const sentimentData = await fs.readFile(sentimentFilePath, 'utf8');
        const sentimentResult = JSON.parse(sentimentData);
        
        latestAnalysis = {
          timestamp: sentimentResult.analysis_timestamp,
          model: sentimentResult.model_used,
          total_analyzed: sentimentResult.total_analyzed,
          average_confidence: sentimentResult.average_confidence
        };
        
        if (sentimentResult.sentiment_distribution) {
          sentimentDistribution = sentimentResult.sentiment_distribution;
        }
      } catch (error) {
        console.error('⚠️ 최신 감정분석 결과 로드 실패:', error.message);
      }
    }
    
    res.json({
      success: true,
      stats: {
        total_news_files: newsFiles.length,
        total_sentiment_files: sentimentFiles.length,
        latest_analysis: latestAnalysis,
        sentiment_distribution: sentimentDistribution
      }
    });
    
  } catch (error) {
    console.error('❌ 감정분석 통계 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '감정분석 통계를 가져오는 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

module.exports = router;
