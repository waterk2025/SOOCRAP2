const axios = require('axios');

async function testServerAPI() {
  try {
    console.log('🔍 서버 API 테스트 시작...');
    
    // 1. 기본 서버 테스트
    console.log('\n1. 기본 서버 테스트:');
    try {
      const baseResponse = await axios.get('http://localhost:3001/');
      console.log('✅ 서버 응답:', baseResponse.data);
    } catch (error) {
      console.error('❌ 기본 서버 연결 실패:', error.message);
      return;
    }
    
    // 2. 모니터링 API 테스트
    console.log('\n2. 모니터링 API 테스트:');
    try {
      const monitoringResponse = await axios.get('http://localhost:3001/api/monitoring/mentions?query=Kwater&display=3');
      console.log('✅ 모니터링 API 응답:');
      console.log('- 성공:', monitoringResponse.data.success);
      console.log('- 총 뉴스 수:', monitoringResponse.data.total);
      console.log('- 검색어:', monitoringResponse.data.query);
      
      if (monitoringResponse.data.data && monitoringResponse.data.data.length > 0) {
        console.log('\n📰 첫 번째 뉴스:');
        const firstNews = monitoringResponse.data.data[0];
        console.log('- 내용:', firstNews.content.substring(0, 100) + '...');
        console.log('- 감성:', firstNews.sentiment);
        console.log('- 키워드:', firstNews.keywords);
      }
      
    } catch (error) {
      console.error('❌ 모니터링 API 호출 실패:', error.message);
      if (error.response) {
        console.error('응답 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data);
      }
    }
    
    console.log('\n🎉 서버 API 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 서버 API 테스트 실패:', error.message);
  }
}

testServerAPI();
