@echo off
echo ========================================
echo SOOCRAP2 PostgreSQL 데이터베이스 설정
echo ========================================
echo.

set PGPATH="C:\Program Files\PostgreSQL\17\bin"
set PGUSER=postgres

echo 1. PostgreSQL 서비스 상태 확인...
sc query postgresql-x64-17

echo.
echo 2. 데이터베이스 생성 중...
echo PostgreSQL postgres 사용자 비밀번호를 입력하세요:

%PGPATH%\psql.exe -U %PGUSER% -c "DROP DATABASE IF EXISTS soocrap_db;"
%PGPATH%\psql.exe -U %PGUSER% -c "CREATE DATABASE soocrap_db WITH OWNER = postgres ENCODING = 'UTF8';"

echo.
echo 3. 데이터베이스 연결 테스트...
%PGPATH%\psql.exe -U %PGUSER% -d soocrap_db -c "SELECT current_database(), current_user;"

echo.
echo ========================================
echo 설정 완료! 
echo 데이터베이스명: soocrap_db
echo 사용자: postgres
echo 연결 문자열: postgresql://postgres:password@localhost:5432/soocrap_db
echo ========================================
pause
