/**
 * 모니터링 정책 모델
 * PostgreSQL 테이블: monitoring_policies
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MonitoringPolicy = sequelize.define('MonitoringPolicy', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '정책 이름'
  },
  keywords: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: '모니터링할 키워드 배열'
  },
  operator: {
    type: DataTypes.ENUM('AND', 'OR'),
    allowNull: false,
    defaultValue: 'OR',
    comment: '키워드 연산자 (AND: 모든 키워드 포함, OR: 키워드 중 하나라도 포함)'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
    comment: '정책 활성화 상태'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '정책 설명'
  },
  created_by: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '정책 생성자'
  },
  last_executed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '마지막 실행 시간'
  },
  execution_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '실행 횟수'
  }
}, {
  tableName: 'monitoring_policies',
  timestamps: true,
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['name']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Article 모델과의 관계 설정 (필요시)
MonitoringPolicy.associate = function(models) {
  // 하나의 정책으로 여러 기사를 수집할 수 있음
  // MonitoringPolicy.hasMany(models.Article, { foreignKey: 'policy_id', as: 'articles' });
};

module.exports = MonitoringPolicy;
