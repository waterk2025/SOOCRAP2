#!/usr/bin/env node
/**
 * 고도화된 감정분석 기능 테스트 스크립트
 * 
 * 사용법:
 * node test-sentiment.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// 테스트할 텍스트들
const TEST_TEXTS = [
  "한국수자원공사가 환경 보호에 기여하는 혁신적인 기술을 개발했습니다.",
  "수질 오염 문제로 주민들이 심각한 우려를 표명하고 있습니다.",
  "정부가 물 관리 정책을 발표했습니다.",
  "댐 건설로 인한 환경 파괴가 우려됩니다.",
  "친환경 수력발전 기술이 성공적으로 개발되었습니다."
];

// 색상 출력을 위한 유틸리티
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// API 테스트 함수들
async function testModelsInfo() {
  try {
    logInfo('모델 정보 조회 테스트...');
    const response = await axios.get(`${BASE_URL}/api/monitoring/sentiment/models`);
    
    if (response.data.success) {
      logSuccess(`사용 가능한 모델 ${response.data.total}개`);
      Object.entries(response.data.models).forEach(([key, model]) => {
        const recommended = model.recommended ? ' (권장)' : '';
        log(`  - ${key}: ${model.name}${recommended}`, 'cyan');
      });
    } else {
      logError('모델 정보 조회 실패');
    }
    
    return response.data;
  } catch (error) {
    logError(`모델 정보 조회 오류: ${error.message}`);
    return null;
  }
}

async function testTextAnalysis(text, modelName = 'klue/bert-base') {
  try {
    logInfo(`텍스트 감정분석 테스트: "${text.substring(0, 30)}..."`);
    
    const response = await axios.post(`${BASE_URL}/api/monitoring/sentiment/analyze-text`, {
      text: text,
      model_name: modelName
    });
    
    if (response.data.success) {
      const result = response.data;
      logSuccess(`감정: ${result.sentiment} (신뢰도: ${(result.confidence * 100).toFixed(1)}%)`);
      
      if (result.scores) {
        log(`  점수 분포:`, 'cyan');
        Object.entries(result.scores).forEach(([emotion, score]) => {
          const percentage = (score * 100).toFixed(1);
          log(`    ${emotion}: ${percentage}%`, 'cyan');
        });
      }
    } else {
      logError('텍스트 감정분석 실패');
    }
    
    return response.data;
  } catch (error) {
    logError(`텍스트 감정분석 오류: ${error.message}`);
    return null;
  }
}

async function testModelPerformance() {
  try {
    logInfo('모델 성능 테스트 시작...');
    
    const response = await axios.post(`${BASE_URL}/api/monitoring/sentiment/test-models`, {
      test_text: "한국수자원공사가 환경 보호에 기여하는 혁신적인 기술을 개발했습니다."
    });
    
    if (response.data.success) {
      logSuccess('모델 성능 테스트 완료');
      
      Object.entries(response.data.results).forEach(([modelKey, result]) => {
        if (result.error) {
          logError(`${modelKey}: ${result.error}`);
        } else {
          logSuccess(`${modelKey}: ${result.sentiment} (${(result.confidence * 100).toFixed(1)}%)`);
        }
      });
    } else {
      logError('모델 성능 테스트 실패');
    }
    
    return response.data;
  } catch (error) {
    logError(`모델 성능 테스트 오류: ${error.message}`);
    return null;
  }
}

async function testSentimentStats() {
  try {
    logInfo('감정분석 통계 조회 테스트...');
    
    const response = await axios.get(`${BASE_URL}/api/monitoring/sentiment/stats`);
    
    if (response.data.success) {
      const stats = response.data.stats;
      logSuccess('감정분석 통계 조회 완료');
      log(`  뉴스 파일: ${stats.total_news_files}개`, 'cyan');
      log(`  감정분석 파일: ${stats.total_sentiment_files}개`, 'cyan');
      
      if (stats.latest_analysis) {
        log(`  최신 분석: ${stats.latest_analysis.timestamp}`, 'cyan');
        log(`  사용 모델: ${stats.latest_analysis.model}`, 'cyan');
        log(`  분석된 데이터: ${stats.latest_analysis.total_analyzed}개`, 'cyan');
      }
      
      if (stats.sentiment_distribution) {
        log(`  감정 분포:`, 'cyan');
        Object.entries(stats.sentiment_distribution).forEach(([emotion, count]) => {
          log(`    ${emotion}: ${count}개`, 'cyan');
        });
      }
    } else {
      logError('감정분석 통계 조회 실패');
    }
    
    return response.data;
  } catch (error) {
    logError(`감정분석 통계 조회 오류: ${error.message}`);
    return null;
  }
}

async function testAllTexts() {
  try {
    logInfo('모든 테스트 텍스트 감정분석 시작...');
    
    for (let i = 0; i < TEST_TEXTS.length; i++) {
      const text = TEST_TEXTS[i];
      log(`\n📝 테스트 ${i + 1}/${TEST_TEXTS.length}:`, 'magenta');
      
      await testTextAnalysis(text);
      
      // 요청 간 간격
      if (i < TEST_TEXTS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    logSuccess('모든 텍스트 감정분석 완료');
  } catch (error) {
    logError(`전체 텍스트 분석 오류: ${error.message}`);
  }
}

// 메인 테스트 함수
async function runAllTests() {
  log('🚀 고도화된 감정분석 기능 테스트 시작', 'bright');
  log('=' * 50, 'cyan');
  
  try {
    // 1. 모델 정보 조회
    await testModelsInfo();
    log('');
    
    // 2. 감정분석 통계 조회
    await testSentimentStats();
    log('');
    
    // 3. 모델 성능 테스트
    await testModelPerformance();
    log('');
    
    // 4. 개별 텍스트 분석
    await testAllTexts();
    log('');
    
    logSuccess('🎉 모든 테스트 완료!');
    
  } catch (error) {
    logError(`테스트 실행 중 오류 발생: ${error.message}`);
  }
}

// 서버 연결 확인
async function checkServerConnection() {
  try {
    logInfo('서버 연결 확인 중...');
    const response = await axios.get(`${BASE_URL}/`);
    
    if (response.data.message) {
      logSuccess(`서버 연결 성공: ${response.data.message}`);
      return true;
    } else {
      logError('서버 응답 형식 오류');
      return false;
    }
  } catch (error) {
    logError(`서버 연결 실패: ${error.message}`);
    logWarning('서버가 실행 중인지 확인해주세요. (node server.js)');
    return false;
  }
}

// 메인 실행
async function main() {
  log('🔍 서버 상태 확인 중...', 'bright');
  
  const serverConnected = await checkServerConnection();
  
  if (!serverConnected) {
    logError('서버에 연결할 수 없습니다. 테스트를 중단합니다.');
    process.exit(1);
  }
  
  log('');
  await runAllTests();
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    logError(`예상치 못한 오류: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testModelsInfo,
  testTextAnalysis,
  testModelPerformance,
  testSentimentStats,
  testAllTexts,
  runAllTests
}; 