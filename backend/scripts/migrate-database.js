/**
 * 데이터베이스 마이그레이션 스크립트
 * keyword_analysis 필드 추가를 위한 스키마 업데이트
 */

const { sequelize } = require('../config/database');
const Article = require('../models/Article');
const MonitoringPolicy = require('../models/MonitoringPolicy');

async function migrateDatabase() {
  try {
    console.log('🔄 데이터베이스 마이그레이션 시작...');
    
    // 1. 데이터베이스 연결 확인
    await sequelize.authenticate();
    console.log('✅ 데이터베이스 연결 확인');
    
    // 2. 현재 테이블 구조 확인
    console.log('📋 현재 테이블 구조 확인 중...');
    
    try {
      // articles 테이블에 keyword_analysis 컬럼이 있는지 확인
      const [results] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name = 'keyword_analysis'
      `);
      
      if (results.length > 0) {
        console.log('✅ keyword_analysis 필드가 이미 존재합니다.');
        console.log('🔄 테이블 동기화를 통해 최신 스키마로 업데이트합니다...');
      } else {
        console.log('📝 keyword_analysis 필드가 없습니다. 추가가 필요합니다.');
      }
      
    } catch (error) {
      console.log('⚠️ 테이블 구조 확인 중 오류 (테이블이 없을 수 있음):', error.message);
    }
    
    // 3. 안전한 스키마 업데이트
    console.log('🔧 스키마 업데이트 중...');
    try {
      // keyword_analysis 컬럼이 존재하는지 확인하고 추가
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
      
      // 기본 동기화로 나머지 스키마 확인
      await sequelize.sync({ force: false });
      console.log('✅ 스키마 업데이트 완료');
      
    } catch (error) {
      console.error('❌ 직접 스키마 업데이트 실패:', error.message);
      console.log('🔄 Sequelize 동기화로 폴백...');
      await sequelize.sync({ force: false });
      console.log('✅ 폴백 동기화 완료');
    }
    
    // 4. 업데이트된 테이블 구조 확인
    console.log('📋 업데이트된 테이블 구조 확인...');
    const [updatedResults] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'articles' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Articles 테이블 구조:');
    updatedResults.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    // 5. 기존 데이터 확인
    const articleCount = await Article.count();
    const policyCount = await MonitoringPolicy.count();
    
    console.log(`📊 데이터 현황:`);
    console.log(`  - Articles: ${articleCount}개`);
    console.log(`  - Monitoring Policies: ${policyCount}개`);
    
    // 6. keyword_analysis 필드가 null인 기사들 확인
    const articlesWithoutKeywordAnalysis = await Article.count({
      where: {
        keyword_analysis: null
      }
    });
    
    console.log(`📊 keyword_analysis가 null인 기사: ${articlesWithoutKeywordAnalysis}개`);
    
    if (articlesWithoutKeywordAnalysis > 0) {
      console.log('💡 기존 기사들의 keyword_analysis를 업데이트하려면 다음 스크립트를 실행하세요:');
      console.log('   node backend/scripts/update-keyword-analysis.js');
    }
    
    console.log('🎉 데이터베이스 마이그레이션 완료!');
    
  } catch (error) {
    console.error('❌ 데이터베이스 마이그레이션 실패:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('✅ 마이그레이션 성공');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 마이그레이션 실패:', error.message);
      process.exit(1);
    });
}

module.exports = { migrateDatabase };
