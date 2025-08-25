// 간단한 감성 분석 서비스
// 실제 프로덕션에서는 더 정교한 감성 분석 API를 사용하는 것을 권장합니다.

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

// 물 관련 긍정 키워드
const WATER_POSITIVE_KEYWORDS = [
  '수질개선', '정수', '깨끗한', '안전한', '신뢰할 수 있는',
  '효율적 관리', '스마트', '첨단', '혁신적', '친환경',
  '지속가능한', '보존', '절약', '재활용'
];

// 물 관련 부정 키워드
const WATER_NEGATIVE_KEYWORDS = [
  '수질오염', '오염', '누출', '단수', '수질문제', '수도요금인상',
  '가뭄', '홍수', '침수', '수해', '수질사고', '정수장고장',
  '하수', '오수', '악취', '부영양화'
];

function analyzeSentiment(text) {
  if (!text) return 'neutral';
  
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  
  // 긍정 키워드 체크
  POSITIVE_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      positiveScore += 1;
    }
  });
  
  // 부정 키워드 체크
  NEGATIVE_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      negativeScore += 1;
    }
  });
  
  // 물 관련 긍정 키워드 체크 (가중치 높음)
  WATER_POSITIVE_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      positiveScore += 2;
    }
  });
  
  // 물 관련 부정 키워드 체크 (가중치 높음)
  WATER_NEGATIVE_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      negativeScore += 2;
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

module.exports = {
  analyzeSentiment
};
