/**
 * 데이터베이스 테이블 초기화 스크립트
 * 모든 기사 데이터를 삭제하고 테이블을 초기화합니다.
 */

require('dotenv').config();
const { sequelize } = require('./config/database');
const Article = require('./models/Article');

async function resetDatabase() {
  try {
    console.log('🗑️ 데이터베이스 테이블 초기화 시작...');
    console.log('📅 시작 시간:', new Date().toISOString());
    
    // 1. 데이터베이스 연결 확인
    console.log('\n1️⃣ 데이터베이스 연결 테스트...');
    await sequelize.authenticate();
    console.log('✅ 데이터베이스 연결 성공');
    
    // 2. 기존 데이터 확인
    console.log('\n2️⃣ 기존 데이터 확인...');
    const existingCount = await Article.count();
    console.log(`📊 기존 기사 수: ${existingCount}개`);
    
    if (existingCount === 0) {
      console.log('ℹ️ 삭제할 데이터가 없습니다.');
    } else {
      // 3. 모든 데이터 삭제
      console.log('\n3️⃣ 모든 기사 데이터 삭제 중...');
      await Article.destroy({
        where: {},
        truncate: true // 테이블 전체 초기화
      });
      console.log(`✅ ${existingCount}개 기사 데이터 삭제 완료`);
    }
    
    // 4. 테이블 재생성 (구조 초기화)
    console.log('\n4️⃣ 테이블 구조 재생성...');
    await sequelize.sync({ force: true }); // 테이블 드롭 후 재생성
    console.log('✅ 테이블 구조 재생성 완료');
    
    // 5. 확인
    console.log('\n5️⃣ 초기화 결과 확인...');
    const finalCount = await Article.count();
    console.log(`📊 현재 기사 수: ${finalCount}개`);
    
    console.log('\n🎉 데이터베이스 테이블 초기화 완료!');
    console.log('📅 완료 시간:', new Date().toISOString());
    console.log('\n📌 다음 단계:');
    console.log('1. 서버 재시작');
    console.log('2. 뉴스 수집 실행 (자동 또는 수동)');
    console.log('3. 데이터베이스에서 감정분석 결과 확인');
    
    return {
      success: true,
      deletedCount: existingCount,
      finalCount: finalCount
    };
    
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error.message);
    console.error('📚 오류 스택:', error.stack);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  console.log('⚠️ 경고: 이 스크립트는 모든 뉴스 데이터를 삭제합니다!');
  console.log('⚠️ 계속하려면 5초 후 실행됩니다...');
  
  setTimeout(() => {
    resetDatabase()
      .then(result => {
        console.log('\n✅ 초기화 성공:', result);
        process.exit(0);
      })
      .catch(error => {
        console.error('\n💥 초기화 실패:', error.message);
        process.exit(1);
      });
  }, 5000);
}

module.exports = { resetDatabase };
