#!/usr/bin/env node
/**
 * 간단한 감정분석 테스트 스크립트
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testSimpleSentiment() {
  try {
    console.log('🔍 간단한 감정분석 테스트 시작...');
    
    // 1. 뉴스 데이터 가져오기 (감정분석 포함)
    console.log('\n📰 뉴스 데이터 가져오기...');
    const newsResponse = await axios.get(`${BASE_URL}/api/monitoring/mentions?display=5`);
    
    if (newsResponse.data.success) {
      console.log(`✅ 뉴스 데이터 ${newsResponse.data.data.length}개 가져오기 성공`);
      
      // 감정분석 결과 확인
      const sentiments = newsResponse.data.data.map(item => ({
        title: item.title?.substring(0, 50) + '...',
        sentiment: item.sentiment,
        query: item.query
      }));
      
      console.log('\n📊 감정분석 결과:');
      sentiments.forEach((item, index) => {
        const emoji = item.sentiment === 'positive' ? '😊' : 
                     item.sentiment === 'negative' ? '😞' : '😐';
        console.log(`${index + 1}. ${emoji} ${item.sentiment} - ${item.title}`);
        console.log(`   검색 키워드: ${item.query}`);
      });
      
      // 감정 분포 통계
      const sentimentCounts = {};
      sentiments.forEach(item => {
        sentimentCounts[item.sentiment] = (sentimentCounts[item.sentiment] || 0) + 1;
      });
      
      console.log('\n📈 감정 분포:');
      Object.entries(sentimentCounts).forEach(([sentiment, count]) => {
        console.log(`   ${sentiment}: ${count}개`);
      });
      
    } else {
      console.error('❌ 뉴스 데이터 가져오기 실패:', newsResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  testSimpleSentiment();
}

module.exports = { testSimpleSentiment }; 