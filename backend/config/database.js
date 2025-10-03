/**
 * 데이터베이스 설정
 * PostgreSQL 연결 설정 및 Sequelize ORM 초기화
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

// 환경변수에서 데이터베이스 설정 읽기
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'soocrap_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
};

// Sequelize 인스턴스 생성
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool,
    define: config.define
  }
);

// 데이터베이스 연결 테스트
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL 데이터베이스 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL 데이터베이스 연결 실패:', error.message);
    return false;
  }
}

// 데이터베이스 동기화 (테이블 생성)
async function syncDatabase(force = false) {
  try {
    await sequelize.sync({ force });
    console.log(`✅ 데이터베이스 동기화 완료 ${force ? '(테이블 재생성)' : ''}`);
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 동기화 실패:', error.message);
    return false;
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};

