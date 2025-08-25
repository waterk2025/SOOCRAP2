#!/usr/bin/env node
/**
 * 전체 데이터 감정분석 테스트 스크립트
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAnalyzeAll() {
  try {
    console.log('🔍 전체 데이터 감정분석 시작...');
    console.log('📍 API 엔드포인트:', `${BASE_URL}/api/monitoring/sentiment/analyze-all`);
    console.log('📤 요청 데이터:', { model_name: 'klue/bert-base' });
    
    console.log('\n📡 HTTP 요청 전송 중...');
    const response = await axios.post(`${BASE_URL}/api/monitoring/sentiment/analyze-all`, {
      model_name: 'klue/bert-base'
    });
    
    console.log('✅ HTTP 응답 수신 완료');
    
    if (response.data.success) {
      console.log('\n🎉 전체 데이터 감정분석 성공!');
      console.log(`📊 분석된 데이터: ${response.data.total_analyzed}개`);
      console.log(`🤖 사용된 모델: ${response.data.model_used}`);
      console.log(`📁 데이터 소스: ${response.data.data_source || 'N/A'}`);
      console.log(`⏰ 분석 시간: ${response.data.analysis_timestamp || 'N/A'}`);
      
      if (response.data.sentiment_distribution) {
        console.log('\n📈 감정 분포:');
        Object.entries(response.data.sentiment_distribution).forEach(([emotion, count]) => {
          console.log(`  ${emotion}: ${count}개`);
        });
      }
      
      if (response.data.average_confidence) {
        console.log(`🎯 평균 신뢰도: ${(response.data.average_confidence * 100).toFixed(1)}%`);
      }
      
      if (response.data.model_info) {
        console.log('\n🤖 모델 정보:');
        console.log(`  모델명: ${response.data.model_info.model_name}`);
        console.log(`  라벨: ${response.data.model_info.labels?.join(', ') || 'N/A'}`);
        console.log(`  임계값: ${response.data.model_info.threshold || 'N/A'}`);
      }
      
      console.log('\n📁 결과가 data 폴더에 저장되었습니다.');
      
    } else {
      console.error('❌ 전체 데이터 감정분석 실패');
      console.error('📋 응답 데이터:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('\n❌ 오류 발생');
    console.error('🚨 오류 타입:', error.constructor.name);
    console.error('📝 오류 메시지:', error.message);
    console.error('📚 오류 스택:', error.stack);
    
    if (error.response) {
      console.error('\n📡 HTTP 응답 오류 정보:');
      console.error('  상태 코드:', error.response.status);
      console.error('  상태 텍스트:', error.response.statusText);
      console.error('  응답 헤더:', error.response.headers);
      console.error('  응답 데이터:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('\n📡 HTTP 요청 오류 정보:');
      console.error('  요청 객체:', error.request);
      console.error('  요청 설정:', error.config);
    } else {
      console.error('\n🔧 기타 오류 정보:');
      console.error('  오류 코드:', error.code);
      console.error('  오류 번호:', error.errno);
      console.error('  시스템 호출:', error.syscall);
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  testAnalyzeAll();
}

module.exports = { testAnalyzeAll }; 