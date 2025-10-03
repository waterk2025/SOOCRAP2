/**
 * 기본 모니터링 정책 초기화 스크립트
 * 시스템 시작 시 기본 정책들을 생성합니다.
 */

require('dotenv').config();
const { sequelize, testConnection } = require('../config/database');
const MonitoringPolicy = require('../models/MonitoringPolicy');

// 기본 정책 데이터 (K-water 평판 모니터링 시스템의 핵심 정책)
const DEFAULT_POLICIES = [
  {
    name: "K-water 브랜드 언급",
    keywords: ["K-water", "Kwater", "KWATER", "한국수자원공사", "수자원공사"],
    operator: "OR",
    status: "active",
    description: "K-water 브랜드와 한국수자원공사 관련 언급을 모니터링하는 기본 정책입니다. 이 정책은 모든 뉴스 수집에서 기본적으로 포함됩니다.",
    created_by: "system"
  }
];

async function initializeDefaultPolicies() {
  try {
    console.log('🚀 기본 모니터링 정책 초기화 시작...');
    
    // 1. 데이터베이스 연결 확인
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('데이터베이스 연결 실패');
    }
    
    // 2. 기존 정책 확인
    const existingPolicies = await MonitoringPolicy.findAll();
    console.log(`📋 기존 정책 수: ${existingPolicies.length}개`);
    
    if (existingPolicies.length > 0) {
      console.log('⚠️ 이미 정책이 존재합니다. 기본 정책 생성을 건너뜁니다.');
      console.log('기존 정책 목록:');
      existingPolicies.forEach(policy => {
        console.log(`  - ${policy.name} (${policy.status})`);
      });
      return {
        success: true,
        message: '기존 정책이 이미 존재합니다.',
        existing_count: existingPolicies.length
      };
    }
    
    // 3. 기본 정책 생성
    console.log('📝 기본 정책 생성 중...');
    const createdPolicies = [];
    
    for (const policyData of DEFAULT_POLICIES) {
      try {
        const policy = await MonitoringPolicy.create(policyData);
        createdPolicies.push(policy);
        console.log(`✅ 정책 생성: "${policy.name}" (${policy.keywords.length}개 키워드)`);
      } catch (error) {
        console.error(`❌ 정책 생성 실패: "${policyData.name}" - ${error.message}`);
      }
    }
    
    console.log(`🎉 기본 정책 초기화 완료: ${createdPolicies.length}개 정책 생성`);
    
    // 4. 생성된 정책 요약
    const activePolicies = createdPolicies.filter(p => p.status === 'active');
    const inactivePolicies = createdPolicies.filter(p => p.status === 'inactive');
    
    console.log('📊 정책 요약:');
    console.log(`  - 활성 정책: ${activePolicies.length}개`);
    console.log(`  - 비활성 정책: ${inactivePolicies.length}개`);
    console.log(`  - 총 키워드 수: ${createdPolicies.reduce((sum, p) => sum + p.keywords.length, 0)}개`);
    
    return {
      success: true,
      message: '기본 정책이 성공적으로 생성되었습니다.',
      created_count: createdPolicies.length,
      active_count: activePolicies.length,
      inactive_count: inactivePolicies.length
    };
    
  } catch (error) {
    console.error('❌ 기본 정책 초기화 실패:', error.message);
    throw error;
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  initializeDefaultPolicies()
    .then(result => {
      console.log('🎉 기본 정책 초기화 성공:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 기본 정책 초기화 실패:', error.message);
      process.exit(1);
    })
    .finally(() => {
      sequelize.close();
    });
}

module.exports = { initializeDefaultPolicies, DEFAULT_POLICIES };
