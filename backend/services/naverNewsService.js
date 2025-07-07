const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

class NaverNewsService {
  constructor() {
    this.clientId = process.env.NAVER_CLIENT_ID;
    this.clientSecret = process.env.NAVER_CLIENT_SECRET;
    this.baseUrl = 'https://openapi.naver.com/v1/search/news.json';
  }

  async getNews(query, display = 10, start = 1, sort = 'date') {
    try {
      // API 키 확인
      if (!this.clientId || !this.clientSecret) {
        throw new Error('네이버 API 키가 설정되지 않았습니다. config.env 파일을 확인해주세요.');
      }

      // 요청 파라미터 설정
      const params = {
        query: encodeURIComponent(query),
        display: Math.min(display, 100), // 기본 10, 최대 100개
        start: Math.min(start, 1000),     // 최대 1000
        sort: sort === 'date' ? 'date' : 'sim'
      };

      // API 호출
      const response = await axios.get(this.baseUrl, {
        params: params,
        headers: {
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret,
          'Content-Type': 'application/json'
        }
      });

      // 응답 데이터 처리
      const newsItems = response.data.items || [];
      
      // mentionsData 형태로 변환
      const formattedNews = newsItems.map((item, index) => ({
        id: start + index,
        title: this.cleanHtmlTags(item.title),
        description: this.cleanHtmlTags(item.description),
        link: item.link,
        originallink: item.originallink,
        pubDate: this.formatDate(item.pubDate),
        author: this.extractAuthor(item.title, item.description)
      }));

      console.log(`✅ 네이버 뉴스 ${formattedNews.length}개 가져오기 성공`);
      return formattedNews;

    } catch (error) {
      console.error('❌ 네이버 뉴스 API 호출 실패:', error.message);
      
      if (error.response) {
        console.error('API 응답 오류:', error.response.status, error.response.data);
        
        // API 오류 코드별 메시지
        switch (error.response.status) {
          case 400:
            throw new Error('잘못된 요청입니다. 검색어나 파라미터를 확인해주세요.');
          case 401:
            throw new Error('인증 실패입니다. API 키를 확인해주세요.');
          case 403:
            throw new Error('API 권한이 없습니다. 네이버 개발자 센터에서 검색 API 사용 권한을 확인해주세요.');
          case 404:
            throw new Error('API 엔드포인트를 찾을 수 없습니다.');
          case 500:
            throw new Error('네이버 서버 오류입니다. 잠시 후 다시 시도해주세요.');
          default:
            throw new Error(`API 호출 실패: ${error.response.status}`);
        }
      }
      
      throw error;
    }
  }

  // HTML 태그 제거
  cleanHtmlTags(text) {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '');
  }

  // 날짜 포맷팅
  formatDate(dateString) {
    if (!dateString) return new Date().toISOString();
    
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  // 기자명 추출 (간단한 방법)
  extractAuthor(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    // 일반적인 기자 패턴
    const reporterPatterns = [
      /([가-힣]+)\s*기자/,
      /([가-힣]+)\s*특파원/,
      /([가-힣]+)\s*통신원/
    ];
    
    for (const pattern of reporterPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1] + ' 기자';
      }
    }
    
    return '기자';
  }
}

// 싱글톤 인스턴스 생성
const naverNewsService = new NaverNewsService();

// 함수 내보내기
async function getNaverNews(query, display, start, sort) {
  return await naverNewsService.getNews(query, display, start, sort);
}

module.exports = {
  getNaverNews,
  NaverNewsService
}; 