# 고도화된 한국어 감정분석 서비스 가이드

## 🎯 개요

이 서비스는 Python 기반의 한국어 감정분석 모델을 사용하여 뉴스 데이터의 감정을 분석합니다. 
기존의 간단한 키워드 기반 분석에서 AI 모델 기반의 정교한 감정분석으로 업그레이드되었습니다.

## 🚀 주요 기능

### 1. 다중 모델 지원
- **klue/bert-base**: 가벼우며 호환성 좋은 BERT 모델 (권장)
- **KcELECTRA-base-v2022**: 최신 한국어 ELECTRA 모델 (메모리 많이 필요)
- **KLUE RoBERTa**: 안정적인 성능의 RoBERTa 모델
- **KR-FinBert-SC**: 한국어 금융 특화 모델

### 2. 고급 감정분석
- 제목과 내용을 결합한 전체 맥락 분석
- 신뢰도 점수 제공
- 긍정/부정/중립 확률 분포
- 배치 처리 지원

### 3. 데이터 관리
- 기존 저장된 뉴스 데이터 자동 로드
- 감정분석 결과 자동 저장
- 중복 분석 방지
- 폴백 시스템 (Python 실패 시 키워드 기반 분석)

## 🔧 설치 및 설정

### 1. Python 환경 설정

```bash
# Python 3.8+ 설치 확인
python --version

# 가상환경 생성 (권장)
python -m venv sentiment_env
source sentiment_env/bin/activate  # Linux/Mac
# 또는
sentiment_env\Scripts\activate     # Windows

# 필요한 패키지 설치
pip install -r requirements.txt
```

### 2. Node.js 패키지 설치

```bash
npm install
```

## 📊 API 엔드포인트

### 1. 모델 정보 조회
```
GET /api/monitoring/sentiment/models
```

### 2. 전체 데이터 감정분석
```
POST /api/monitoring/sentiment/analyze-all
Body: { "model_name": "beomi/KcELECTRA-base-v2022" }
```

### 3. 특정 텍스트 감정분석
```
POST /api/monitoring/sentiment/analyze-text
Body: { "text": "분석할 텍스트", "model_name": "모델명" }
```

### 4. 감정분석 통계
```
GET /api/monitoring/sentiment/stats
```

## 🧪 사용 예시

### 1. 서버 시작
```bash
cd backend
node server.js
```

### 2. 모델 정보 확인
```bash
curl http://localhost:3001/api/monitoring/sentiment/models
```

### 3. 전체 데이터 분석
```bash
curl -X POST http://localhost:3001/api/monitoring/sentiment/analyze-all \
  -H "Content-Type: application/json" \
  -d '{"model_name": "beomi/KcELECTRA-base-v2022"}'
```

### 4. 텍스트 분석
```