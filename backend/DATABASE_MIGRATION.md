# 데이터베이스 마이그레이션 가이드

## 개요
`keyword_analysis` 필드 추가를 위한 데이터베이스 스키마 업데이트 가이드입니다.

## 변경사항
- **Article 모델**: `keyword_analysis` 필드 추가 (JSON 타입)
- 키워드별 중요도, 언급 횟수, 제목 포함 여부 등 상세 정보 저장

## 마이그레이션 방법

### 1. 자동 마이그레이션 (권장)
서버 시작 시 자동으로 스키마가 업데이트됩니다.

```bash
# 서버 시작 (자동 마이그레이션 포함)
npm run dev
```

### 2. 수동 마이그레이션
필요시 수동으로 마이그레이션을 실행할 수 있습니다.

```bash
# 스키마 마이그레이션만 실행
npm run db:migrate

# 또는 직접 실행
node backend/scripts/migrate-database.js
```

### 3. 기존 데이터 업데이트
기존 기사들의 `keyword_analysis`를 업데이트합니다.

```bash
# 기존 기사들의 키워드 분석 업데이트
npm run db:update-keywords

# 또는 직접 실행
node backend/scripts/update-keyword-analysis.js
```

## 마이그레이션 과정

### 1단계: 스키마 업데이트
- `articles` 테이블에 `keyword_analysis` 컬럼 추가
- 기존 데이터는 보존됨
- 새 컬럼은 NULL 허용

### 2단계: 기존 데이터 업데이트 (선택사항)
- 기존 기사들의 `keyword_analysis` 필드 업데이트
- 키워드 중요도 분석 수행
- 배치 처리로 안전하게 업데이트

## 새로운 keyword_analysis 구조

```json
[
  {
    "keyword": "수질",
    "mentions": 3,
    "inTitle": true,
    "importance": 6
  },
  {
    "keyword": "정수",
    "mentions": 2,
    "inTitle": false,
    "importance": 2
  }
]
```

### 필드 설명
- `keyword`: 키워드명
- `mentions`: 기사 내 언급 횟수
- `inTitle`: 제목에 포함 여부
- `importance`: 중요도 점수 (제목: 3점, 본문 언급: 1점씩)

## 롤백 방법

만약 문제가 발생한 경우:

```bash
# 데이터베이스 백업에서 복원
# 또는 컬럼 제거 (데이터 손실 주의!)
```

```sql
-- PostgreSQL에서 컬럼 제거 (주의: 데이터 손실!)
ALTER TABLE articles DROP COLUMN keyword_analysis;
```

## 확인 방법

### 스키마 확인
```sql
-- articles 테이블 구조 확인
\d articles

-- keyword_analysis 컬럼 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name = 'keyword_analysis';
```

### 데이터 확인
```sql
-- keyword_analysis가 있는 기사 수 확인
SELECT COUNT(*) FROM articles WHERE keyword_analysis IS NOT NULL;

-- 샘플 데이터 확인
SELECT id, title, keyword_analysis 
FROM articles 
WHERE keyword_analysis IS NOT NULL 
LIMIT 5;
```

## 주의사항

1. **백업 권장**: 마이그레이션 전 데이터베이스 백업 수행
2. **점진적 업데이트**: 기존 데이터 업데이트는 선택사항
3. **성능 고려**: 대량 데이터 업데이트 시 배치 처리 사용
4. **모니터링**: 마이그레이션 과정 모니터링 필요

## 문제 해결

### 마이그레이션 실패 시
1. 데이터베이스 연결 확인
2. 권한 확인 (ALTER TABLE 권한 필요)
3. 디스크 공간 확인
4. 로그 확인

### 성능 이슈 시
1. 배치 크기 조정
2. 인덱스 최적화
3. 트랜잭션 분할

## 지원

문제 발생 시 다음 정보와 함께 문의:
- 에러 메시지
- 데이터베이스 버전
- 데이터 규모
- 실행 환경
