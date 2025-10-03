/**
 * 데이터베이스 초기화 스크립트
 * PostgreSQL 데이터베이스 및 테이블 생성
 */

require('dotenv').config();
const { sequelize, testConnection, syncDatabase } = require('../config/database');
const Article = require('../models/Article');
const MonitoringPolicy = require('../models/MonitoringPolicy');
const { migrateDatabase } = require('./migrate-database');

async function initializeDatabase() {
  console.log('🚀 데이터베이스 초기화 시작...');
  
  try {
    // 1. 데이터베이스 연결 테스트
    console.log('1️⃣ 데이터베이스 연결 테스트...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('데이터베이스 연결 실패');
    }
    
    // 2. 스키마 마이그레이션 (기존 데이터 보존하면서 스키마 업데이트)
    console.log('2️⃣ 스키마 마이그레이션 중...');
    await sequelize.sync({ alter: true }); // alter: true로 기존 데이터 보존하면서 스키마 업데이트
    
    // 3. 테이블 정보 확인
    console.log('3️⃣ 생성된 테이블 정보:');
    const articlesTableInfo = await sequelize.getQueryInterface().describeTable('articles');
    console.log('📋 articles 테이블 컬럼:', Object.keys(articlesTableInfo));
    
    const policiesTableInfo = await sequelize.getQueryInterface().describeTable('monitoring_policies');
    console.log('📋 monitoring_policies 테이블 컬럼:', Object.keys(policiesTableInfo));
    
    console.log('✅ 데이터베이스 초기화 완료!');
    console.log('');
    console.log('📌 다음 단계:');
    console.log('1. PostgreSQL이 실행 중인지 확인');
    console.log('2. .env 파일에 데이터베이스 설정 입력');
    console.log('3. npm run dev로 서버 시작');
    
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error.message);
    console.log('');
    console.log('🔧 문제 해결 방법:');
    console.log('1. PostgreSQL이 설치되고 실행 중인지 확인');
    console.log('2. .env 파일의 데이터베이스 설정 확인');
    console.log('3. 데이터베이스가 생성되어 있는지 확인');
    console.log('   CREATE DATABASE soocrap_db;');
    
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };

