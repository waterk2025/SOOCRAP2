/**
 * 뉴스 수집 스케줄러
 * 정기적으로 네이버 뉴스 API에서 데이터를 수집하여 데이터베이스에 저장
 */

const cron = require('node-cron');
const { collectAndSaveNews } = require('../scripts/news-collector');

class NewsScheduler {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
    this.stats = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastError: null
    };
  }

  // 스케줄러 시작
  start() {
    if (this.isRunning) {
      console.log('⚠️ 뉴스 수집 스케줄러가 이미 실행 중입니다.');
      return;
    }

    console.log('🚀 뉴스 수집 스케줄러 시작...');
    
    // 매 2시간마다 실행 (0분에)
    this.cronJob = cron.schedule('0 */2 * * *', async () => {
      await this.runNewsCollection();
    }, {
      scheduled: false,
      timezone: "Asia/Seoul"
    });

    // 스케줄러 시작
    this.cronJob.start();
    this.isRunning = true;
    
    // 다음 실행 시간 계산
    this.updateNextRunTime();
    
    console.log('✅ 뉴스 수집 스케줄러가 시작되었습니다.');
    console.log('📅 스케줄: 매 2시간마다 (0분에)');
    console.log('🕐 다음 실행: ', this.nextRun);
    
    // 서버 시작 시 즉시 한 번 실행
    setTimeout(() => {
      console.log('🏃‍♂️ 서버 시작 시 초기 뉴스 수집 실행...');
      this.runNewsCollection();
    }, 5000); // 5초 후 실행
  }

  // 스케줄러 중지
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ 뉴스 수집 스케줄러가 실행 중이 아닙니다.');
      return;
    }

    if (this.cronJob) {
      this.cronJob.stop();
    }
    
    this.isRunning = false;
    this.nextRun = null;
    
    console.log('🛑 뉴스 수집 스케줄러가 중지되었습니다.');
  }

  // 뉴스 수집 실행
  async runNewsCollection() {
    const startTime = new Date();
    console.log(`\n🚀 정기 뉴스 수집 시작: ${startTime.toISOString()}`);
    
    this.stats.totalRuns++;
    this.lastRun = startTime;
    
    try {
      const result = await collectAndSaveNews();
      
      this.stats.successfulRuns++;
      this.stats.lastError = null;
      
      const endTime = new Date();
      const duration = endTime - startTime;
      
      console.log(`✅ 정기 뉴스 수집 완료: ${endTime.toISOString()}`);
      console.log(`⏱️ 소요 시간: ${duration}ms`);
      console.log(`📊 수집 결과:`, result);
      
    } catch (error) {
      this.stats.failedRuns++;
      this.stats.lastError = {
        message: error.message,
        timestamp: new Date().toISOString()
      };
      
      console.error(`❌ 정기 뉴스 수집 실패: ${error.message}`);
    }
    
    // 다음 실행 시간 업데이트
    this.updateNextRunTime();
    
    console.log(`📈 스케줄러 통계:`);
    console.log(`  - 총 실행: ${this.stats.totalRuns}회`);
    console.log(`  - 성공: ${this.stats.successfulRuns}회`);
    console.log(`  - 실패: ${this.stats.failedRuns}회`);
    console.log(`  - 다음 실행: ${this.nextRun}`);
  }

  // 다음 실행 시간 계산
  updateNextRunTime() {
    if (!this.isRunning) {
      this.nextRun = null;
      return;
    }

    const now = new Date();
    const next = new Date(now);
    
    // 다음 2시간 간격의 0분으로 설정
    next.setMinutes(0);
    next.setSeconds(0);
    next.setMilliseconds(0);
    
    // 현재 시간이 이미 지났으면 다음 2시간 후로
    if (next <= now) {
      next.setHours(next.getHours() + 2);
    }
    
    // 2시간 간격으로 맞추기
    const hours = next.getHours();
    const adjustedHours = Math.ceil(hours / 2) * 2;
    next.setHours(adjustedHours);
    
    this.nextRun = next.toISOString();
  }

  // 수동 실행
  async runManually() {
    if (!this.isRunning) {
      throw new Error('스케줄러가 실행 중이 아닙니다.');
    }

    console.log('🖐 수동 뉴스 수집 실행...');
    await this.runNewsCollection();
  }

  // 상태 조회
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      stats: { ...this.stats },
      schedule: '매 2시간마다 (0분에)',
      timezone: 'Asia/Seoul'
    };
  }
}

// 싱글톤 인스턴스
const newsScheduler = new NewsScheduler();

module.exports = newsScheduler;
