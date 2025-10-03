-- SOOCRAP2 프로젝트용 PostgreSQL 데이터베이스 설정
-- 실행 방법: psql -U postgres -f setup-database.sql

-- 1. 데이터베이스 생성
DROP DATABASE IF EXISTS soocrap_db;
CREATE DATABASE soocrap_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Korean_Korea.949'
    LC_CTYPE = 'Korean_Korea.949'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- 2. 사용자 생성 (선택사항 - 보안을 위해 별도 사용자 생성)
-- DROP USER IF EXISTS soocrap_user;
-- CREATE USER soocrap_user WITH PASSWORD 'soocrap_password';

-- 3. 권한 부여
-- GRANT ALL PRIVILEGES ON DATABASE soocrap_db TO soocrap_user;

-- 데이터베이스 연결
\c soocrap_db;

-- 4. 확장 기능 설치 (필요한 경우)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 5. 스키마 확인
SELECT current_database(), current_user;

-- 완료 메시지
-- alter user postgres with password 'kwater12#';
\echo '✅ SOOCRAP2 데이터베이스 설정 완료!'
\echo '📋 데이터베이스명: soocrap_db'
\echo '👤 사용자: postgres'
\echo '🔗 연결 문자열: postgresql://postgres:password@localhost:5432/soocrap_db'

