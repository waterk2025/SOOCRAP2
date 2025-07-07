const { getNaverNews } = require('./services/naverNewsService');

async function testNaverAPI() {
  try {
    console.log('🔍 네이버 뉴스 API 테스트 시작...');
    
    // API 키 확인
    console.log('\n1. API 키 확인:');
    const dotenv = require('dotenv');
    dotenv.config({ path: './config.env' });
    
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;
    
    console.log('- CLIENT_ID:', clientId ? '설정됨' : '설정되지 않음');
    console.log('- CLIENT_SECRET:', clientSecret ? '설정됨' : '설정되지 않음');
    
    if (!clientId || !clientSecret) {
      console.error('❌ API 키가 설정되지 않았습니다.');
      return;
    }
    
    // 단일 키워드로 테스트
    const testKeywords = ['Kwater', '수자원공사', '댐', '물관리'];
    
    for (const keyword of testKeywords) {
      console.log(`\n2. 키워드 "${keyword}" 테스트:`);
      
      const newsData = await getNaverNews(keyword, 5, 1, 'date'); // 날짜순으로 최신 뉴스
      
      console.log(`✅ "${keyword}" 검색 결과:`);
      console.log('- 총 뉴스 수:', newsData.length);
      
      if (newsData.length > 0) {
        console.log('\n📰 뉴스들:');
        newsData.forEach((news, index) => {
          const hasKeyword = news.title.includes(keyword) || news.description.includes(keyword);
          console.log(`${index + 1}. 제목: ${news.title}`);
          console.log(`   설명: ${news.description.substring(0, 50)}...`);
          console.log(`   관련성: ${hasKeyword ? '✅ 관련' : '❌ 무관'}`);
          console.log('');
        });
      } else {
        console.log('❌ 검색 결과가 없습니다.');
      }
    }
    
    console.log('\n🎉 네이버 뉴스 API 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 네이버 뉴스 API 테스트 실패:', error.message);
    
    if (error.response) {
      console.error('API 응답 오류:');
      console.error('- 상태 코드:', error.response.status);
      console.error('- 응답 데이터:', error.response.data);
    }
  }
}

testNaverAPI(); 