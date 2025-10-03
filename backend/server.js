const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config({ path: './.env' });

// 데이터베이스 설정
const { sequelize, testConnection, syncDatabase } = require('./config/database');

// 뉴스 수집 스케줄러
const newsScheduler = require('./services/newsScheduler');

// 기본 정책 초기화
const { initializeDefaultPolicies } = require('./scripts/init-default-policies');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// 라우터 가져오기
const monitoringRoutes = require('./routes/monitoring');
const policiesRoutes = require('./routes/policies');
const analysisRoutes = require('./routes/analysis');

// 라우터 설정
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/policies', policiesRoutes);
app.use('/api/analysis', analysisRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: '수크랩 백엔드 API 서버',
    version: '1.0.0',
    endpoints: {
      monitoring: '/api/monitoring',
      policies: '/api/policies',
      analysis: '/api/analysis'
    }
  });
});

// 데이터베이스 초기화 및 서버 시작
async function startServer() {
  try {
    // 데이터베이스 연결 테스트
    console.log('🔌 데이터베이스 연결 확인 중...');
    const isConnected = await testConnection();
    
    if (isConnected) {
      // 스키마 마이그레이션 (기존 데이터 보존하면서 스키마 업데이트)
      console.log('📋 데이터베이스 스키마 마이그레이션 중...');
      try {
        // 먼저 테이블이 존재하는지 확인
        const queryInterface = sequelize.getQueryInterface();
        const tableExists = await queryInterface.showAllTables();
        
        if (tableExists.includes('articles')) {
          console.log('📋 기존 테이블 감지 - 안전한 마이그레이션 수행');
          
          // keyword_analysis 컬럼이 존재하는지 확인
          try {
            const [results] = await sequelize.query(`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'articles' 
              AND column_name = 'keyword_analysis'
            `);
            
            if (results.length === 0) {
              console.log('📝 keyword_analysis 컬럼 추가 중...');
              await sequelize.query(`
                ALTER TABLE articles 
                ADD COLUMN keyword_analysis JSON
              `);
              console.log('✅ keyword_analysis 컬럼 추가 완료');
            } else {
              console.log('✅ keyword_analysis 컬럼이 이미 존재합니다');
            }
          } catch (columnError) {
            console.log('⚠️ 컬럼 추가 중 오류 (이미 존재할 수 있음):', columnError.message);
          }
          
          // 나머지 스키마는 force: false로 동기화
          await sequelize.sync({ force: false });
        } else {
          console.log('📋 새 테이블 생성');
          await sequelize.sync({ force: false });
        }
        
        console.log('✅ 데이터베이스 준비 완료');
      } catch (syncError) {
        console.error('❌ 스키마 마이그레이션 실패:', syncError.message);
        console.log('🔄 기본 동기화로 폴백...');
        await sequelize.sync({ force: false });
        console.log('✅ 기본 동기화 완료');
      }
      
      // 기본 정책 초기화
      console.log('📝 기본 모니터링 정책 초기화 중...');
      try {
        await initializeDefaultPolicies();
        console.log('✅ 기본 정책 초기화 완료');
      } catch (error) {
        console.warn('⚠️ 기본 정책 초기화 실패:', error.message);
      }
      
      // 뉴스 수집 스케줄러 시작
      console.log('📅 뉴스 수집 스케줄러 시작...');
      newsScheduler.start();
    } else {
      console.warn('⚠️ 데이터베이스 연결 실패 - 파일 시스템 모드로 실행');
      console.warn('⚠️ 스케줄러는 데이터베이스 연결이 필요하므로 시작하지 않습니다.');
    }
    
    // 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`📡 프론트엔드: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`🔗 API 엔드포인트: http://localhost:${PORT}/api`);
      console.log(`📊 모니터링: http://localhost:${PORT}/api/monitoring/mentions`);
      console.log(`💾 데이터베이스 모드: http://localhost:${PORT}/api/monitoring/mentions/database`);
    });
    
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error.message);
    process.exit(1);
  }
}

startServer();
