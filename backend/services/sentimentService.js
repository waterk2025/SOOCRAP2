const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs').promises;

/**
 * 고도화된 한국어 감정분석 서비스
 * Python 기반의 한국어 감정분석 모델을 사용
 */

// 사용 가능한 한국어 감정분석 모델들
const KOREAN_SENTIMENT_MODELS = {
  "klue_bert": {
    name: "klue/bert-base",
    description: "KLUE BERT 모델 (가벼우며 호환성 좋음)",
    threshold: 0.6,
    recommended: true
  },
  "kc_electra_v2022": {
    name: "beomi/KcELECTRA-base-v2022",
    description: "최신 한국어 ELECTRA 모델 (감정분석 특화, 메모리 많이 필요)",
    threshold: 0.4,
    recommended: false
  },
  "klue_roberta": {
    name: "klue/roberta-base",
    description: "KLUE RoBERTa 모델 (안정적 성능)",
    threshold: 0.6
  },
  "kr_finbert": {
    name: "snunlp/KR-FinBert-SC",
    description: "한국어 금융 감정분석 모델",
    threshold: 0.1
  }
};

/**
 * Python 감정분석 스크립트 실행
 * @param {Array} newsData - 뉴스 데이터 배열
 * @param {string} modelName - 사용할 모델명
 * @returns {Promise<Object>} 감정분석 결과
 */
async function runPythonSentimentAnalysis(newsData, modelName = "klue/bert-base") {
  return new Promise((resolve, reject) => {
    try {
      console.log('🤖 Python 감정분석 실행 준비...');
      
      const scriptPath = path.join(__dirname, '..', 'scripts', 'sentiment_analyzer.py');
      console.log('📜 Python 스크립트 경로:', scriptPath);
      
      // 입력 데이터 준비
      const inputData = {
        news_data: newsData,
        model_name: modelName
      };
      console.log('📤 입력 데이터 구조:', {
        news_data_count: newsData.length,
        model_name: modelName,
        first_item_preview: newsData.length > 0 ? {
          title: newsData[0].title?.substring(0, 30) + '...',
          description: newsData[0].description?.substring(0, 50) + '...'
        } : 'N/A'
      });
      
      const options = {
        mode: 'text', // 'json' 대신 'text' 사용하여 수동 파싱
        pythonPath: path.join(__dirname, '..', 'sentiment_env', 'Scripts', 'python.exe'), // 가상환경의 Python 사용
        pythonOptions: ['-u'], // unbuffered output
        scriptPath: path.dirname(scriptPath),
        args: [JSON.stringify(inputData)],
        env: {
          ...process.env,
          PYTHONPATH: path.join(__dirname, '..', 'sentiment_env', 'Lib', 'site-packages')
        }
      };
      
      console.log('⚙️ Python 실행 옵션:', {
        pythonPath: options.pythonPath,
        scriptPath: options.scriptPath,
        pythonOptions: options.pythonOptions,
        envKeys: Object.keys(options.env)
      });
      
      console.log(`🤖 Python 감정분석 시작: ${modelName}`);
      console.log(`📊 분석할 뉴스 데이터: ${newsData.length}개`);
      
      const pyshell = new PythonShell(path.basename(scriptPath), options);
      console.log('✅ PythonShell 객체 생성 완료');
      
      let result = null;
      let error = null;
      let outputBuffer = '';
      let messageCount = 0;
      
      pyshell.on('message', function (message) {
        messageCount++;
        console.log(`📈 Python 스크립트 메시지 #${messageCount}:`, message);
        
        // 출력을 버퍼에 누적 (여러 줄 출력 처리)
        outputBuffer += message + '\n';
      });
      
      pyshell.on('error', function (err) {
        console.error('❌ Python 스크립트 에러 이벤트:', err);
        error = err;
      });
      
      pyshell.on('close', function (code) {
        console.log(`🔚 Python 스크립트 종료 (코드: ${code})`);
      });
      
      pyshell.end(function (err) {
        console.log('🏁 Python 스크립트 실행 완료');
        console.log('📊 출력 버퍼 내용:', outputBuffer);

        
        if (err) {
          console.error('❌ Python 스크립트 실행 오류:', err);
          error = err;
        }
        
        if (error) {
          console.error('❌ 에러로 인한 실패');
          reject(error);
        } else if (outputBuffer.trim()) {
          console.log('✅ 결과 처리 시작...');
          try {
            // JSON 파싱 시도
            let parsedResult;
            const fullOutput = outputBuffer.trim();
            console.log('🔄 전체 출력 JSON 파싱 시도...');
            
            // Python 출력에서 JSON 부분만 추출
            let jsonContent = fullOutput;
            
            // 로그나 에러 메시지가 JSON 앞에 있을 수 있으므로 '{'로 시작하는 부분 찾기
            const jsonStartIndex = jsonContent.indexOf('{');
            if (jsonStartIndex !== -1) {
              jsonContent = jsonContent.substring(jsonStartIndex);
              console.log('🔍 JSON 시작 위치 찾음, 추출된 내용:', jsonContent.substring(0, 100) + '...');
            }
            
            try {
              parsedResult = JSON.parse(jsonContent);
              console.log('✅ JSON 파싱 성공');
            } catch (parseError) {
              console.warn('⚠️ JSON 파싱 실패, 원본 데이터 반환:', parseError.message);
              console.log('📝 파싱 실패한 원본 데이터:', fullOutput);
              console.log('📝 추출 시도한 JSON 내용:', jsonContent);
              parsedResult = { error: 'JSON 파싱 실패', raw_output: fullOutput };
            }
            
            console.log('🎯 최종 반환 결과:', parsedResult);
            resolve(parsedResult);
          } catch (parseError) {
            console.error('❌ 결과 처리 중 오류:', parseError.message);
            reject(new Error(`결과 처리 실패: ${parseError.message}`));
          }
        } else {
          console.error('❌ 결과가 없음');
          reject(new Error('Python 스크립트에서 결과를 받지 못했습니다.'));
        }
      });
      
    } catch (err) {
      console.error('❌ Python 감정분석 실행 중 오류:', err);
      reject(err);
    }
  });
}

/**
 * 기존 저장된 뉴스 데이터 로드
 * @returns {Promise<Array>} 뉴스 데이터 배열
 */
async function loadExistingNewsData() {
  try {
    console.log('📚 기존 저장된 뉴스 데이터 로드 시작...');
    
    const dataDir = path.join(__dirname, '..', 'data');
    console.log('📁 데이터 디렉토리 경로:', dataDir);
    
    // data 폴더가 없으면 빈 배열 반환
    try {
      await fs.access(dataDir);
    } catch (error) {
      console.log('📁 data 폴더가 존재하지 않습니다.');
      return [];
    }
    
    console.log('✅ data 폴더 존재 확인 완료');
    
    // 뉴스 데이터 JSON 파일들만 찾기
    console.log('🔍 뉴스 데이터 JSON 파일 검색 중...');
    const files = await fs.readdir(dataDir);
    console.log(`📋 전체 파일 목록 (${files.length}개):`, files);
    
    // news_data_ 로 시작하는 JSON 파일만 필터링
    const newsJsonFiles = files.filter(file => 
      file.startsWith('news_data_') && file.endsWith('.json')
    ).sort().reverse();
    console.log(`📄 뉴스 데이터 JSON 파일 목록 (${newsJsonFiles.length}개):`, newsJsonFiles);
    
    if (newsJsonFiles.length === 0) {
      console.log('📁 뉴스 데이터 파일이 없습니다.');
      return [];
    }
    
    // 가장 최근 파일 로드
    const latestFile = newsJsonFiles[0];
    console.log('⭐ 가장 최근 파일 선택:', latestFile);
    
    const filepath = path.join(dataDir, latestFile);
    console.log('📂 전체 파일 경로:', filepath);
    
    console.log('📖 파일 읽기 시작...');
    const fileContent = await fs.readFile(filepath, 'utf8');
    console.log(`📊 파일 크기: ${fileContent.length} 문자`);
    console.log('📝 파일 내용 미리보기 (처음 200자):', fileContent.substring(0, 200));
    
    console.log('🔄 JSON 파싱 시작...');
    const data = JSON.parse(fileContent);
    console.log(`✅ JSON 파싱 완료: ${typeof data}, 길이: ${Array.isArray(data) ? data.length : 'N/A'}`);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('📰 첫 번째 뉴스 항목 미리보기:');
      console.log('  제목:', data[0].title?.substring(0, 50) + '...');
      console.log('  설명:', data[0].description?.substring(0, 100) + '...');
      console.log('  날짜:', data[0].pubDate);
      console.log('  URL:', data[0].link);
    }
    
    console.log(`📚 기존 데이터 파일 로드 완료: ${latestFile} (${data.length}개 항목)`);
    return Array.isArray(data) ? data : [];
    
  } catch (error) {
    console.error('⚠️ 기존 데이터 로드 실패');
    console.error('🚨 오류 타입:', error.constructor.name);
    console.error('📝 오류 메시지:', error.message);
    console.error('📚 오류 스택:', error.stack);
    return [];
  }
}

/**
 * 고도화된 감정분석 수행
 * @param {string|Array} textOrData - 분석할 텍스트 또는 뉴스 데이터
 * @param {string} modelName - 사용할 모델명
 * @returns {Promise<Object>} 감정분석 결과
 */
async function analyzeSentiment(textOrData, modelName = "klue/bert-base") {
  try {
    // 단일 텍스트인 경우
    if (typeof textOrData === 'string') {
      const newsData = [{
        title: '분석 텍스트',
        description: textOrData
      }];
      return await runPythonSentimentAnalysis(newsData, modelName);
    }
    
    // 뉴스 데이터 배열인 경우
    if (Array.isArray(textOrData)) {
      return await runPythonSentimentAnalysis(textOrData, modelName);
    }
    
    throw new Error('지원하지 않는 데이터 형식입니다.');
    
  } catch (error) {
    console.error('❌ 감정분석 실패:', error.message);
    
    // 폴백: 간단한 키워드 기반 분석
    console.log('🔄 간단한 키워드 기반 감정분석으로 폴백');
    return fallbackSentimentAnalysis(textOrData);
  }
}

/**
 * 기존 데이터 전체 감정분석
 * @param {string} modelName - 사용할 모델명
 * @returns {Promise<Object>} 전체 감정분석 결과
 */
async function analyzeAllExistingData(modelName = "klue/bert-base") {
  try {
    console.log('🔍 기존 저장된 데이터 전체 감정분석 시작');
    console.log('🤖 사용할 모델:', modelName);
    console.log('⏰ 시작 시간:', new Date().toISOString());
    
    // 기존 데이터 로드
    console.log('\n📚 1단계: 기존 뉴스 데이터 로드 시작...');
    const existingData = await loadExistingNewsData();
    
    if (existingData.length === 0) {
      console.log('❌ 분석할 데이터가 없습니다.');
      return {
        success: false,
        message: '분석할 데이터가 없습니다.',
        total: 0
      };
    }
    
    console.log(`✅ 1단계 완료: ${existingData.length}개 뉴스 데이터 로드 완료`);
    
    // 데이터 구조 검증
    console.log('\n🔍 2단계: 데이터 구조 검증...');
    if (existingData.length > 0) {
      const firstItem = existingData[0];
      console.log('📰 첫 번째 항목 구조:');
      console.log('  - id:', firstItem.id);
      console.log('  - title:', firstItem.title ? '존재' : '없음');
      console.log('  - description:', firstItem.description ? '존재' : '없음');
      console.log('  - link:', firstItem.link ? '존재' : '없음');
      console.log('  - pubDate:', firstItem.pubDate ? '존재' : '없음');
    }
    
    console.log(`✅ 2단계 완료: 데이터 구조 검증 완료`);
    
    // Python 감정분석 실행
    console.log('\n🤖 3단계: Python 감정분석 실행 시작...');
    console.log(`📊 분석할 데이터 수: ${existingData.length}개`);
    console.log(`🎯 분석 모델: ${modelName}`);
    
    const startTime = Date.now();
    const sentimentResult = await runPythonSentimentAnalysis(existingData, modelName);
    const endTime = Date.now();
    
    console.log(`✅ 3단계 완료: Python 감정분석 완료 (소요시간: ${endTime - startTime}ms)`);
    console.log('📊 감정분석 결과 타입:', typeof sentimentResult);
    console.log('📊 감정분석 결과:', sentimentResult);
    
    // 결과에 기존 데이터 정보 추가
    console.log('\n🔧 4단계: 결과 데이터 보강...');
    const enhancedResult = {
      ...sentimentResult,
      success: true,
      data_source: 'backend/data',
      analysis_timestamp: new Date().toISOString(),
      model_used: modelName,
      processing_time_ms: endTime - startTime,
      input_data_count: existingData.length
    };
    
    console.log('✅ 4단계 완료: 결과 데이터 보강 완료');
    
    // 결과를 파일로 저장
    console.log('\n💾 5단계: 결과 파일 저장...');
    await saveSentimentAnalysisResult(enhancedResult);
    console.log('✅ 5단계 완료: 결과 파일 저장 완료');
    
    console.log('\n🎉 전체 데이터 감정분석 완료!');
    console.log(`📊 총 처리된 데이터: ${existingData.length}개`);
    console.log(`⏱️ 총 소요 시간: ${endTime - startTime}ms`);
    
    return enhancedResult;
    
  } catch (error) {
    console.error('❌ 전체 데이터 감정분석 실패');
    console.error('🚨 오류 타입:', error.constructor.name);
    console.error('📝 오류 메시지:', error.message);
    console.error('📚 오류 스택:', error.stack);
    console.error('⏰ 오류 발생 시간:', new Date().toISOString());
    
    return {
      success: false,
      error: error.message,
      message: '감정분석 중 오류가 발생했습니다.',
      error_timestamp: new Date().toISOString()
    };
  }
}

/**
 * 감정분석 결과를 파일로 저장
 * @param {Object} result - 감정분석 결과
 */
async function saveSentimentAnalysisResult(result) {
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `sentiment_analysis_${timestamp}.json`;
    const filepath = path.join(dataDir, filename);
    
    // data 폴더가 없으면 생성
    const fsSync = require('fs');
    if (!fsSync.existsSync(dataDir)) {
      fsSync.mkdirSync(dataDir, { recursive: true });
    }
    
    // 결과를 JSON 파일로 저장
    await fs.writeFile(filepath, JSON.stringify(result, null, 2), 'utf8');
    
    console.log(`💾 감정분석 결과 저장: ${filepath}`);
    
  } catch (error) {
    console.error('❌ 감정분석 결과 저장 실패:', error.message);
  }
}

/**
 * 폴백 감정분석 (간단한 키워드 기반)
 * @param {string|Array} textOrData - 분석할 텍스트 또는 데이터
 * @returns {Object} 폴백 감정분석 결과
 */
function fallbackSentimentAnalysis(textOrData) {
  console.log('🔄 폴백 감정분석 실행 (키워드 기반)');
  
  // 기존의 간단한 키워드 기반 분석 로직
  const POSITIVE_KEYWORDS = [
    '성공', '개선', '혁신', '발전', '증가', '상승', '긍정', '좋은', '훌륭한',
    '효과적', '효율적', '친환경', '지속가능', '안전', '신뢰', '투명',
    '혜택', '이익', '성과', '성취', '완료', '해결', '개선', '최적화', "나눔", "공동체", "사회공헌"
  ];
  
  const NEGATIVE_KEYWORDS = [
    '실패', '문제', '오류', '오작동', '중단', '지연', '손실', '피해',
    '부정', '나쁜', '악화', '감소', '하락', '위험', '불안', '우려',
    '비용', '손해', '폐기', '중단', '차단', '오염', '누출', '사고'
  ];
  
  const WATER_POSITIVE_KEYWORDS = [
    '수질개선', '정수', '깨끗한', '안전한', '신뢰할 수 있는',
    '효율적 관리', '스마트', '첨단', '혁신적', '친환경',
    '지속가능한', '보존', '절약', '재활용'
  ];
  
  const WATER_NEGATIVE_KEYWORDS = [
    '수질오염', '오염', '누출', '단수', '수질문제', '수도요금인상',
    '가뭄', '홍수', '침수', '수해', '수질사고', '정수장고장',
    '하수', '오수', '악취', '부영양화'
  ];
  
  function analyzeText(text) {
    if (!text) return 'neutral';
    
    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    
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
  
  // 단일 텍스트인 경우
  if (typeof textOrData === 'string') {
    const sentiment = analyzeText(textOrData);
    return {
      sentiment: sentiment,
      confidence: 0.5,
      method: 'fallback_keyword',
      model: 'keyword_based',
      scores: {
        positive: sentiment === 'positive' ? 0.8 : 0.1,
        neutral: sentiment === 'neutral' ? 0.8 : 0.1,
        negative: sentiment === 'negative' ? 0.8 : 0.1
      }
    };
  }
  
  // 배열인 경우
  if (Array.isArray(textOrData)) {
    const results = textOrData.map(item => {
      const text = `${item.title || ''} ${item.description || ''}`;
      const sentiment = analyzeText(text);
      return {
        sentiment: sentiment,
        confidence: 0.5,
        method: 'fallback_keyword',
        model: 'keyword_based'
      };
    });
    
    return {
      method: 'fallback_keyword',
      model: 'keyword_based',
      total_analyzed: results.length,
      individual_results: results
    };
  }
  
  return {
    sentiment: 'neutral',
    confidence: 0.0,
    method: 'fallback_keyword',
    model: 'keyword_based',
    error: '지원하지 않는 데이터 형식'
  };
}

/**
 * 사용 가능한 모델 정보 반환
 * @returns {Object} 모델 정보
 */
function getAvailableModels() {
  return KOREAN_SENTIMENT_MODELS;
}


module.exports = {
  // 고도화된 감정분석 함수들
  analyzeSentiment,
  analyzeAllExistingData,
  getAvailableModels,
  
  // 기존 호환성을 위한 함수
  analyzeSentiment: analyzeSentiment
}; 
