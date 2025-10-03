/**
 * 뉴스 기사 모델
 * PostgreSQL 테이블: articles
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '기사 제목'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '기사 내용'
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true,
    comment: '기사 URL (중복 방지용)'
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '작성자'
  },
  source: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '출처 (네이버뉴스, 블로그 등)'
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '발행일시'
  },
  search_keyword: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '검색에 사용된 키워드'
  },
  query: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '개별 쿼리 정보'
  },
  unique_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '고유 식별자'
  },
  keywords: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: '추출된 키워드 배열'
  },
  sentiment: {
    type: DataTypes.ENUM('positive', 'negative', 'neutral'),
    allowNull: true,
    comment: '감정분석 결과'
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: '감정분석 신뢰도 (0-1)'
  },
  ai_analyzed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'AI 감정분석 여부'
  },
  sentiment_scores: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '감정분석 상세 점수 (positive, negative, neutral)'
  },
  model_used: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '사용된 감정분석 모델명'
  },
  policy_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '수집에 사용된 모니터링 정책 ID'
  },
  policy_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '수집에 사용된 모니터링 정책 이름'
  },
  keyword_analysis: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '키워드 중요도 분석 결과 (keyword, mentions, inTitle, importance)'
  }
}, {
  tableName: 'articles',
  timestamps: true,
  indexes: [
    {
      fields: ['url'],
      unique: true
    },
    {
      fields: ['published_at']
    },
    {
      fields: ['sentiment']
    },
    {
      fields: ['search_keyword']
    },
    {
      fields: ['ai_analyzed']
    }
  ]
});

module.exports = Article;

