# SOOCRAP2 - 수자원 모니터링 시스템

## 📋 프로젝트 개요

SOOCRAP2는 한국수자원공사(K-water) 관련 뉴스와 언급을 모니터링하고 분석하는 시스템입니다. 
네이버 뉴스 API를 통해 실시간 데이터를 수집하고, 고도화된 한국어 감정분석을 통해 뉴스의 감정을 분석합니다.

## 🚀 주요 기능

### 1. 뉴스 모니터링
- **다중 키워드 검색**: K-water, 한국수자원공사, 물관리, 수력발전, 댐 등
- **실시간 수집**: 네이버 뉴스 API를 통한 최신 뉴스 수집
- **중복 제거**: 스마트한 중복 제거 알고리즘
- **데이터 저장**: JSON 형태로 뉴스 데이터 영구 저장

### 2. 고도화된 감정분석 🆕
- **AI 모델 기반**: Python 기반 한국어 감정분석 모델 사용
- **다중 모델 지원**: KcELECTRA, KLUE RoBERTa, KLUE BERT, KR-FinBert
- **정확한 분류**: 긍정/부정/중립을 신뢰도 점수와 함께 제공
- **폴백 시스템**: AI 모델 실패 시 키워드 기반 분석으로 자동 전환

### 3. 데이터 관리
- **자동 저장**: 수집된 뉴스 데이터 자동 저장
- **ID 관리**: 연속적인 ID 할당으로 데이터 일관성 보장
- **필터링**: 관련 없는 URL 및 콘텐츠 자동 제외
- **통계 제공**: 감정분석 결과 통계 및 분포 정보

## 🏗️ 프로젝트 구조

```
SOOCRAP2/
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   └── monitoring-content.tsx  # 모니터링 메인 컴포넌트
│   │   └── ...
│   └── ...
├── backend/                     # Node.js 백엔드
│   ├── services/
│   │   ├── naverNewsService.js     # 네이버 뉴스 API 서비스
│   │   └── sentimentService.js     # 고도화된 감정분석 서비스
│   ├── routes/
│   │   └── monitoring.js           # 모니터링 API 라우터
│   ├── scripts/
│   │   └── sentiment_analyzer.py   # Python 감정분석 스크립트
│   ├── data/                       # 뉴스 데이터 및 분석 결과 저장
│   ├── server.js                   # 메인 서버 파일
│   ├── requirements.txt            # Python 패키지 목록
│   └── README_SENTIMENT.md        # 감정분석 상세 가이드
└── README.md
```

## 🔧 기술 스택

### 백엔드
- **Node.js + Express**: RESTful API 서버
- **Python**: 한국어 감정분석 모델 실행
- **Transformers**: Hugging Face 기반 AI 모델
- **Python-Shell**: Node.js와 Python 연동

### 프론트엔드
- **React**: 사용자 인터페이스
- **TypeScript**: 타입 안전성
- **Axios**: HTTP 클라이언트

### AI/ML
- **KcELECTRA-base-v2022**: 최신 한국어 감정분석 모델
- **KLUE RoBERTa**: 안정적인 한국어 모델
- **KR-FinBert-SC**: 한국어 금융 특화 모델

## 📊 API 엔드포인트

### 기본 모니터링
- `GET /api/monitoring/mentions` - 뉴스 데이터 조회
- `GET /api/monitoring/mentions?query=키워드` - 특정 키워드 검색

### 고도화된 감정분석 🆕
- `GET /api/monitoring/sentiment/models` - 사용 가능한 모델 정보
- `POST /api/monitoring/sentiment/analyze-all` - 전체 데이터 감정분석
- `POST /api/monitoring/sentiment/analyze-text` - 특정 텍스트 감정분석
- `POST /api/monitoring/sentiment/test-models` - 모델 성능 테스트
- `GET /api/monitoring/sentiment/stats` - 감정분석 통계

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/waterk2025/SOOCRAP2.git
cd SOOCRAP2
```

### 2. 백엔드 설정
```bash
cd backend

# Node.js 패키지 설치
npm install

# Python 환경 설정 (권장)
python -m venv sentiment_env
source sentiment_env/bin/activate  # Linux/Mac
# 또는
sentiment_env\Scripts\activate     # Windows

# Python 패키지 설치
pip install -r requirements.txt
```

### 3. 환경 변수 설정
```bash
# backend/config.env 파일 생성
cp config.env.example config.env

# 네이버 API 키 설정
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret
```

### 4. 서버 실행
```bash
# 백엔드 서버 시작
cd backend
node server.js

# 프론트엔드 개발 서버 시작 (새 터미널)
pnpm dev 하면 
```

## 🧪 테스트

### 감정분석 기능 테스트
```bash
cd backend
node test-sentiment.js
```

### API 테스트
```bash
# 모델 정보 조회
curl http://localhost:3001/api/monitoring/sentiment/models

# 텍스트 감정분석
curl -X POST http://localhost:3001/api/monitoring/sentiment/analyze-text \
  -H "Content-Type: application/json" \
  -d '{"text": "한국수자원공사가 환경 보호에 기여하는 기술을 개발했습니다."}'
```

## 📈 성능 및 특징

### 감정분석 정확도
- **KcELECTRA-base-v2022**: 최고 성능 (권장)
- **KLUE RoBERTa**: 안정적 성능
- **폴백 시스템**: AI 모델 실패 시 키워드 기반 분석

### 데이터 처리
- **중복 제거**: 제목+URL+날짜 기반 고유 ID 생성
- **배치 처리**: 여러 텍스트 동시 분석
- **자동 저장**: 분석 결과 자동 저장 및 관리

## 🔄 업데이트 내역

### 0708 오후 - 고도화된 감정분석 시스템 구현 🆕
- **Python 기반 AI 모델**: 한국어 감정분석 모델 통합
- **다중 모델 지원**: 4가지 한국어 감정분석 모델 제공
- **고급 분석**: 신뢰도 점수, 확률 분포, 배치 처리
- **폴백 시스템**: AI 모델 실패 시 자동 전환
- **새로운 API**: 감정분석 전용 엔드포인트 추가
- **통계 기능**: 감정분석 결과 통계 및 분포 정보

### 0708 오전 - 키워드별 검색 및 필터링 시스템 구현
- **다중 키워드 검색**: 12개 키워드 개별 쿼리 검색
- **중복 제거**: 고유 ID 기반 스마트 중복 제거
- **ID 재할당**: 연속적인 ID 부여로 데이터 일관성 보장
- **URL 필터링**: 관련 없는 도메인 자동 제외
- **프론트엔드 통합**: 실시간 데이터 표시 및 업데이트

### 0707 - 백엔드 구현 완료
- **Express 서버**: RESTful API 서버 구축
- **네이버 뉴스 API**: 뉴스 데이터 수집 서비스
- **감정분석**: 키워드 기반 기본 감정분석
- **프로젝트 구조**: 모듈화된 백엔드 아키텍처

## 🎯 향후 계획

1. **실시간 분석**: 스트리밍 데이터 감정분석
2. **시각화**: 감정분석 결과 차트 및 대시보드
3. **알림 시스템**: 중요 뉴스 자동 알림
4. **멀티 언어**: 영어, 중국어 등 추가 언어 지원
5. **도메인 특화**: 수자원 분야 특화 모델 학습

## 📞 지원 및 문의

프로젝트 관련 문의사항이나 개선 제안이 있으시면 이슈를 등록해주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.