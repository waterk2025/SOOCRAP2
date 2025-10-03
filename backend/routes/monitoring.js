const express = require('express');
const router = express.Router();
const { 
  analyzeSentiment, 
  analyzeAllExistingData, 
  getAvailableModels 
} = require('../services/sentimentService');
const { collectAndSaveNews } = require('../scripts/news-collector');
const newsScheduler = require('../services/newsScheduler');

// 모니터링 키워드 목록
const MONITORING_KEYWORDS = [
  'kwater', 'Kwater', 'K-water', 'KWATER',
  '한국수자원공사', '수자원공사',
  '물관리', '수력발전', '댐', '수상태양광', '디지털플랫폼'
];

// 모든 언급 데이터 가져오기 (데이터베이스에서만)
router.get('/mentions', async (req, res) => {
  try {
    const Article = require('../models/Article');
    const { Op } = require('sequelize');
    const { 
      offset = 0, 
      sentiment = null, 
      keyword = null,
      days = 180,
      query = null
    } = req.query;
    
    console.log('📊 데이터베이스에서 언급 데이터 조회...');
    
    // 조건 설정
    const whereConditions = {};
    
    // 날짜 필터 (최근 N일)
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    whereConditions.published_at = {
      [Op.gte]: daysAgo
    };
    
    // 감정 필터
    if (sentiment && ['positive', 'negative', 'neutral'].includes(sentiment)) {
      whereConditions.sentiment = sentiment;
    }
    
    // 키워드 필터
    if (keyword || query) {
      const searchTerm = keyword || query;
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${searchTerm}%` } },
        { content: { [Op.iLike]: `%${searchTerm}%` } },
        { search_keyword: { [Op.iLike]: `%${searchTerm}%` } }
      ];
    }
    
    // 데이터 조회 (제한 없음)
    const { count, rows: articles } = await Article.findAndCountAll({
      where: whereConditions,
      order: [['published_at', 'DESC']],
      offset: parseInt(offset)
    });
    
    // 응답 형식으로 변환
    const mentionsData = articles.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      sentiment: article.sentiment,
      confidence: article.confidence,
      aiAnalyzed: article.ai_analyzed,
      source: article.source || '네이버뉴스',
      author: article.author,
      timestamp: article.published_at.toISOString(),
      url: article.url,
      keywords: article.keywords || [],
      query: article.query,
      uniqueId: article.unique_id,
      sentimentScores: article.sentiment_scores,
      modelUsed: article.model_used,
      policyId: article.policy_id,
      policyName: article.policy_name || '기본 수집'
    }));
    
    // 감정 분포 통계
    const sentimentStats = await Article.findAll({
      where: whereConditions,
      attributes: [
        'sentiment',
        [require('sequelize').fn('COUNT', require('sequelize').col('sentiment')), 'count']
      ],
      group: ['sentiment'],
      raw: true
    });
    
    const sentimentDistribution = sentimentStats.reduce((acc, stat) => {
      acc[stat.sentiment || 'neutral'] = parseInt(stat.count);
      return acc;
    }, { positive: 0, negative: 0, neutral: 0 });
    
    console.log(`✅ 데이터베이스에서 ${mentionsData.length}개 언급 데이터 조회 완료`);
    
    res.json({
      success: true,
      data: mentionsData,
      total: count,
      offset: parseInt(offset),
      filters: {
        sentiment,
        keyword: keyword || query,
        days: parseInt(days)
      },
      sentimentDistribution,
      source: 'database',
      keywords: MONITORING_KEYWORDS,
      message: '데이터베이스에서 조회된 결과입니다. 새로운 뉴스는 정기적으로 수집됩니다.'
    });
    
  } catch (error) {
    console.error('❌ 데이터베이스 언급 데이터 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '데이터베이스에서 언급 데이터를 가져오는 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});


// 고도화된 감정분석 API 엔드포인트들

// 사용 가능한 감정분석 모델 정보 조회
router.get('/sentiment/models', async (req, res) => {
  try {
    const models = getAvailableModels();
    res.json({
      success: true,
      models: models,
      total: Object.keys(models).length
    });
  } catch (error) {
    console.error('❌ 모델 정보 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '모델 정보를 가져오는 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 기존 저장된 데이터 전체 감정분석
router.post('/sentiment/analyze-all', async (req, res) => {
  try {
    const { model_name = 'klue/bert-base' } = req.body;
    
    console.log(`🔍 전체 데이터 감정분석 시작 (모델: ${model_name})`);
    
    const result = await analyzeAllExistingData(model_name);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('❌ 전체 데이터 감정분석 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '전체 데이터 감정분석 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 특정 텍스트 감정분석
router.post('/sentiment/analyze-text', async (req, res) => {
  try {
    const { text, model_name = 'klue/bert-base' } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: '분석할 텍스트를 입력해주세요.'
      });
    }
    
    console.log(`🔍 텍스트 감정분석 시작: "${text.substring(0, 50)}..." (모델: ${model_name})`);
    
    const result = await analyzeSentiment(text, model_name);
    
    res.json({
      success: true,
      text: text,
      ...result
    });
    
  } catch (error) {
    console.error('❌ 텍스트 감정분석 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '텍스트 감정분석 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 감정분석 결과 통계 조회
router.get('/sentiment/stats', async (req, res) => {
  try {
    const Article = require('../models/Article');
    
    // 전체 기사 수
    const totalArticles = await Article.count();
    
    // 감정별 통계
    const sentimentStats = await Article.findAll({
      attributes: [
        'sentiment',
        [require('sequelize').fn('COUNT', require('sequelize').col('sentiment')), 'count']
      ],
      group: ['sentiment'],
      raw: true
    });
    
    const sentimentDistribution = sentimentStats.reduce((acc, stat) => {
      acc[stat.sentiment || 'neutral'] = parseInt(stat.count);
      return acc;
    }, { positive: 0, negative: 0, neutral: 0 });
    
    // AI 분석 통계
    const aiAnalyzedCount = await Article.count({
      where: { ai_analyzed: true }
    });
    
    // 최근 분석 정보
    const latestArticle = await Article.findOne({
      order: [['updated_at', 'DESC']],
      attributes: ['updated_at', 'model_used']
    });
    
    const latestAnalysis = latestArticle ? {
      timestamp: latestArticle.updated_at,
      model: latestArticle.model_used,
      total_analyzed: totalArticles,
      ai_analyzed_count: aiAnalyzedCount
    } : null;
    
    res.json({
      success: true,
      stats: {
        total_articles: totalArticles,
        ai_analyzed_count: aiAnalyzedCount,
        latest_analysis: latestAnalysis,
        sentiment_distribution: sentimentDistribution
      }
    });
    
  } catch (error) {
    console.error('❌ 감정분석 통계 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '감정분석 통계를 가져오는 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});


// 수동 뉴스 수집 엔드포인트
router.post('/collect-news', async (req, res) => {
  try {
    console.log('🚀 수동 뉴스 수집 시작...');
    
    const result = await collectAndSaveNews();
    
    res.json({
      success: true,
      message: '뉴스 수집이 완료되었습니다.',
      ...result
    });
    
  } catch (error) {
    console.error('❌ 수동 뉴스 수집 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '뉴스 수집 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 스케줄러 상태 조회
router.get('/scheduler/status', (req, res) => {
  try {
    const status = newsScheduler.getStatus();
    
    res.json({
      success: true,
      scheduler: status
    });
    
  } catch (error) {
    console.error('❌ 스케줄러 상태 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '스케줄러 상태를 조회하는 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 스케줄러 제어 (시작/중지)
router.post('/scheduler/:action', (req, res) => {
  try {
    const { action } = req.params;
    
    if (action === 'start') {
      newsScheduler.start();
      res.json({
        success: true,
        message: '스케줄러가 시작되었습니다.'
      });
    } else if (action === 'stop') {
      newsScheduler.stop();
      res.json({
        success: true,
        message: '스케줄러가 중지되었습니다.'
      });
    } else if (action === 'run') {
      // 수동 실행
      newsScheduler.runManually().then(() => {
        console.log('✅ 수동 스케줄러 실행 완료');
      }).catch(error => {
        console.error('❌ 수동 스케줄러 실행 실패:', error.message);
      });
      
      res.json({
        success: true,
        message: '스케줄러 수동 실행이 시작되었습니다.'
      });
    } else {
      res.status(400).json({
        success: false,
        error: '지원하지 않는 액션입니다. (start, stop, run)'
      });
    }
    
  } catch (error) {
    console.error('❌ 스케줄러 제어 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '스케줄러 제어 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

module.exports = router;
