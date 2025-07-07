const express = require('express');
const router = express.Router();
const { getNaverNews } = require('../services/naverNewsService');
const { analyzeSentiment } = require('../services/sentimentService');

// 모니터링 키워드 목록
const MONITORING_KEYWORDS = [
  'kwater', 'Kwater', 'K-water', 'KWATER',
  '한국수자원공사', '수자원공사',
  '물관리', '수력발전', '댐', '수상태양광', '디지털플랫폼'
];

// 모든 언급 데이터 가져오기
router.get('/mentions', async (req, res) => {
  try {
    const { query, display = 10, start = 1, sort = 'date' } = req.query;
    
    let allNewsData = [];
    
    if (query) {
      // 특정 검색어가 있으면 해당 검색어로만 검색
      console.log(`🔍 특정 키워드 검색: ${query}`);
      const newsData = await getNaverNews(query, display, start, sort);
      allNewsData = newsData;
    } else {
      // 모든 모니터링 키워드로 검색
      console.log(`🔍 ${MONITORING_KEYWORDS.length}개 키워드로 뉴스 검색 시작`);
      
      const searchPromises = MONITORING_KEYWORDS.map(async (keyword, index) => {
        try {
          // 각 키워드당 적은 수의 뉴스를 가져와서 중복을 줄임
          const perKeywordCount = Math.max(3, Math.floor(display / MONITORING_KEYWORDS.length));
          const newsData = await getNaverNews(keyword, perKeywordCount, 1, sort);
          
          // 키워드 정보 추가
          return newsData.map(item => ({
            ...item,
            searchKeyword: keyword
          }));
        } catch (error) {
          console.error(`❌ 키워드 "${keyword}" 검색 실패:`, error.message);
          return [];
        }
      });
      
      // 모든 검색 결과를 병렬로 실행
      const allResults = await Promise.all(searchPromises);
      allNewsData = allResults.flat();
      
      // 중복 제거 (URL 기준)
      const uniqueNews = removeDuplicates(allNewsData);
      allNewsData = uniqueNews;
      
      console.log(`✅ 총 ${allNewsData.length}개 뉴스 수집 완료 (중복 제거 후)`);
    }
    
    // 감성 분석 적용
    const mentionsWithSentiment = allNewsData.map(item => ({
      id: item.id,
      content: item.description,
      sentiment: analyzeSentiment(item.description),
      source: '네이버 뉴스',
      author: item.author || '기자',
      timestamp: item.pubDate,
      url: item.link,
      keywords: extractKeywords(item.description, item.searchKeyword || query)
    }));
    
    res.json({
      success: true,
      data: mentionsWithSentiment,
      total: mentionsWithSentiment.length,
      query: query || '다중 키워드 검색',
      keywords: query ? [query] : MONITORING_KEYWORDS
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

// 중복 제거 함수 (URL 기준)
function removeDuplicates(newsArray) {
  const seen = new Set();
  return newsArray.filter(item => {
    const url = item.link || item.originallink;
    if (seen.has(url)) {
      return false;
    }
    seen.add(url);
    return true;
  });
}

// 키워드 추출 함수
function extractKeywords(text, searchKeyword) {
  const keywords = [];
  
  // 검색어를 키워드로 추가
  if (searchKeyword) {
    keywords.push(searchKeyword);
  }
  
  // 일반적인 물 관련 키워드들
  const waterKeywords = [
    '수질', '수도요금', '단수', '댐', '홍수', '가뭄', '정수', '하수',
    '물관리', '수력발전', '수상태양광', '디지털플랫폼', '스마트워터',
    '수자원', '수도', '정수장', '하수처리장', '댐관리'
  ];
  
  waterKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  // 중복 제거
  return [...new Set(keywords)];
}

module.exports = router; 