const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const Article = require('../models/Article');
const MonitoringPolicy = require('../models/MonitoringPolicy');

/**
 * 분석 관련 API 엔드포인트
 * 정책별 키워드 트렌드, 시간대별 언급, 관련 키워드 분석 등
 */

// 정책별 키워드 트렌드 분석
router.get('/keyword-trends/:policyId', async (req, res) => {
  try {
    const { policyId } = req.params;
    const { months = 6 } = req.query;

    console.log(`📊 정책 ${policyId}의 키워드 트렌드 분석 시작...`);

    // 정책 정보 조회
    const policy = await MonitoringPolicy.findByPk(policyId);
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: '해당 정책을 찾을 수 없습니다.'
      });
    }

    // 최근 N개월 데이터 조회 범위 설정
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));

    console.log(`📅 분석 기간: ${monthsAgo.toISOString()} ~ ${new Date().toISOString()}`);

    // 전체 기사에서 정책 키워드가 포함된 기사들 조회 (policy_id 제한 제거)
    const allArticles = await Article.findAll({
      where: {
        published_at: {
          [Op.gte]: monthsAgo
        },
        [Op.or]: policy.keywords.map(keyword => ({
          [Op.or]: [
            { title: { [Op.iLike]: `%${keyword}%` } },
            { content: { [Op.iLike]: `%${keyword}%` } }
          ]
        }))
      },
      attributes: ['id', 'title', 'content', 'published_at', 'sentiment'],
      order: [['published_at', 'ASC']]
    });

    console.log(`📰 분석 대상 기사 수: ${allArticles.length}개`);

    // 월별 키워드별 언급 수 분석
    const monthlyKeywordData = {};
    const keywordMentions = {};

    // 키워드별 총 언급 수 초기화
    policy.keywords.forEach(keyword => {
      keywordMentions[keyword] = 0;
    });

    // 각 기사를 분석하여 키워드 언급 수 계산
    allArticles.forEach(article => {
      const month = new Date(article.published_at).toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyKeywordData[month]) {
        monthlyKeywordData[month] = { date: month };
        policy.keywords.forEach(keyword => {
          monthlyKeywordData[month][keyword] = 0;
        });
      }

      // 각 키워드가 이 기사에서 언급되는지 확인
      const fullText = `${article.title} ${article.content}`.toLowerCase();
      
      policy.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        // 키워드가 포함되어 있으면 카운트 증가
        if (fullText.includes(keywordLower)) {
          monthlyKeywordData[month][keyword]++;
          keywordMentions[keyword]++;
        }
      });
    });

    // 빈 월 데이터 채우기 (최근 N개월 전체 기간)
    const completeMonthlyData = [];
    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (monthlyKeywordData[monthKey]) {
        completeMonthlyData.push(monthlyKeywordData[monthKey]);
      } else {
        // 데이터가 없는 월은 0으로 채우기
        const emptyMonth = { date: monthKey };
        policy.keywords.forEach(keyword => {
          emptyMonth[keyword] = 0;
        });
        completeMonthlyData.push(emptyMonth);
      }
    }

    // 추가 통계 정보
    const totalMentions = Object.values(keywordMentions).reduce((sum, count) => sum + count, 0);
    const avgMentionsPerMonth = completeMonthlyData.length > 0 ? 
      totalMentions / completeMonthlyData.length : 0;

    console.log(`📊 키워드별 총 언급 수:`, keywordMentions);
    console.log(`📈 월평균 언급 수: ${avgMentionsPerMonth.toFixed(1)}`);

    res.json({
      success: true,
      policy: {
        id: policy.id,
        name: policy.name,
        keywords: policy.keywords,
        description: policy.description
      },
      trendData: completeMonthlyData,
      keywordMentions,
      statistics: {
        totalArticlesAnalyzed: allArticles.length,
        totalMentions,
        avgMentionsPerMonth: Math.round(avgMentionsPerMonth * 10) / 10,
        period: `최근 ${months}개월`
      },
      period: `최근 ${months}개월`
    });

  } catch (error) {
    console.error('❌ 키워드 트렌드 분석 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '키워드 트렌드 분석 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 시간대별 언급 분석
router.get('/time-analysis', async (req, res) => {
  try {
    const { days = 180 } = req.query;

    console.log(`⏰ 시간대별 언급 분석 시작 (최근 ${days}일)...`);

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // 시간대별 언급 수 집계
    const timeAnalysis = await Article.findAll({
      where: {
        published_at: {
          [Op.gte]: daysAgo
        }
      },
      attributes: [
        [fn('EXTRACT', literal('HOUR FROM published_at')), 'hour'],
        [fn('COUNT', col('id')), 'mentions']
      ],
      group: [fn('EXTRACT', literal('HOUR FROM published_at'))],
      order: [[fn('EXTRACT', literal('HOUR FROM published_at')), 'ASC']],
      raw: true
    });

    // 24시간 데이터 구조화
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      mentions: 0
    }));

    timeAnalysis.forEach(data => {
      const hour = parseInt(data.hour);
      hourlyData[hour].mentions = parseInt(data.mentions);
    });

    res.json({
      success: true,
      data: hourlyData,
      period: `최근 ${days}일`,
      totalMentions: hourlyData.reduce((sum, item) => sum + item.mentions, 0)
    });

  } catch (error) {
    console.error('❌ 시간대별 분석 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '시간대별 분석 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 정책별 관련 키워드 및 감성 분석
router.get('/related-keywords/:policyId', async (req, res) => {
  try {
    const { policyId } = req.params;
    const { limit = 20 } = req.query;

    console.log(`🔍 정책 ${policyId}의 관련 키워드 분석 시작...`);

    // 정책 정보 조회
    const policy = await MonitoringPolicy.findByPk(policyId);
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: '해당 정책을 찾을 수 없습니다.'
      });
    }

    // 전체 기사에서 정책 키워드가 포함된 기사들 조회 (더 넓은 범위)
    const articles = await Article.findAll({
      where: {
        [Op.or]: policy.keywords.map(keyword => ({
          [Op.or]: [
            { title: { [Op.iLike]: `%${keyword}%` } },
            { content: { [Op.iLike]: `%${keyword}%` } }
          ]
        })),
        keywords: {
          [Op.ne]: null
        }
      },
      attributes: ['keywords', 'keyword_analysis', 'sentiment', 'confidence', 'title', 'content'],
      limit: 1000 // 분석 대상 제한
    });

    console.log(`🔍 관련 키워드 분석 대상 기사: ${articles.length}개`);

    // 키워드 빈도 및 감성 분석 (개선된 로직)
    const keywordStats = {};
    
    articles.forEach(article => {
      // 기존 keywords 배열 사용
      if (article.keywords && Array.isArray(article.keywords)) {
        article.keywords.forEach(keyword => {
          if (!keywordStats[keyword]) {
            keywordStats[keyword] = {
              keyword,
              count: 0,
              sentiments: { positive: 0, negative: 0, neutral: 0 },
              totalConfidence: 0,
              totalImportance: 0,
              inTitleCount: 0
            };
          }
          
          keywordStats[keyword].count++;
          if (article.sentiment) {
            keywordStats[keyword].sentiments[article.sentiment]++;
          }
          if (article.confidence) {
            keywordStats[keyword].totalConfidence += article.confidence;
          }
          
          // keyword_analysis 정보 활용
          if (article.keyword_analysis && Array.isArray(article.keyword_analysis)) {
            const keywordInfo = article.keyword_analysis.find(ka => ka.keyword === keyword);
            if (keywordInfo) {
              keywordStats[keyword].totalImportance += keywordInfo.importance || 0;
              if (keywordInfo.inTitle) {
                keywordStats[keyword].inTitleCount++;
              }
            }
          }
        });
      }
    });

    // 키워드 통계 계산 및 정렬 (개선된 로직)
    const relatedKeywords = Object.values(keywordStats)
      .map(stat => {
        const total = stat.sentiments.positive + stat.sentiments.negative + stat.sentiments.neutral;
        const dominantSentiment = total > 0 ? 
          Object.keys(stat.sentiments).reduce((a, b) => 
            stat.sentiments[a] > stat.sentiments[b] ? a : b
          ) : 'neutral';
        
        // 중요도 기반 강도 계산 (기존 방식 + 중요도 가중치)
        const baseStrength = Math.min(100, Math.round((stat.count / articles.length) * 100));
        const importanceBonus = stat.totalImportance > 0 ? 
          Math.min(20, Math.round(stat.totalImportance / stat.count)) : 0;
        const titleBonus = stat.inTitleCount > 0 ? 
          Math.min(15, Math.round((stat.inTitleCount / stat.count) * 15)) : 0;
        
        const finalStrength = Math.min(100, baseStrength + importanceBonus + titleBonus);
        
        return {
          keyword: stat.keyword,
          strength: finalStrength,
          sentiment: dominantSentiment,
          count: stat.count,
          avgConfidence: total > 0 ? Math.round(stat.totalConfidence / total * 100) / 100 : 0,
          avgImportance: stat.count > 0 ? Math.round(stat.totalImportance / stat.count * 100) / 100 : 0,
          inTitleRatio: stat.count > 0 ? Math.round((stat.inTitleCount / stat.count) * 100) : 0,
          sentimentDistribution: stat.sentiments
        };
      })
      .filter(item => item.count > 1) // 최소 2번 이상 언급된 키워드만
      .sort((a, b) => b.strength - a.strength)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      policy: {
        id: policy.id,
        name: policy.name,
        keywords: policy.keywords
      },
      relatedKeywords,
      totalArticles: articles.length,
      analysisDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 관련 키워드 분석 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '관련 키워드 분석 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// AI 인사이트 생성
router.get('/insights/:policyId', async (req, res) => {
  try {
    const { policyId } = req.params;
    const { days = 180 } = req.query;

    console.log(`🤖 정책 ${policyId}의 AI 인사이트 생성 시작...`);

    // 정책 정보 조회
    const policy = await MonitoringPolicy.findByPk(policyId);
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: '해당 정책을 찾을 수 없습니다.'
      });
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // 기본 통계 수집
    const totalArticles = await Article.count({
      where: {
        policy_id: policyId,
        published_at: { [Op.gte]: daysAgo }
      }
    });

    // 감성 분포
    const sentimentStats = await Article.findAll({
      where: {
        policy_id: policyId,
        published_at: { [Op.gte]: daysAgo }
      },
      attributes: [
        'sentiment',
        [fn('COUNT', col('sentiment')), 'count'],
        [fn('AVG', col('confidence')), 'avgConfidence']
      ],
      group: ['sentiment'],
      raw: true
    });

    const sentimentDistribution = sentimentStats.reduce((acc, stat) => {
      acc[stat.sentiment || 'neutral'] = {
        count: parseInt(stat.count),
        avgConfidence: parseFloat(stat.avgConfidence) || 0
      };
      return acc;
    }, { positive: { count: 0, avgConfidence: 0 }, negative: { count: 0, avgConfidence: 0 }, neutral: { count: 0, avgConfidence: 0 } });

    // 트렌드 분석 (이전 기간과 비교)
    const previousPeriodStart = new Date(daysAgo);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(days));

    const previousArticles = await Article.count({
      where: {
        policy_id: policyId,
        published_at: { 
          [Op.gte]: previousPeriodStart,
          [Op.lt]: daysAgo
        }
      }
    });

    const trendChange = previousArticles > 0 ? 
      ((totalArticles - previousArticles) / previousArticles * 100) : 0;

    // AI 인사이트 생성
    const insights = generateInsights(policy, {
      totalArticles,
      sentimentDistribution,
      trendChange,
      days: parseInt(days)
    });

    res.json({
      success: true,
      policy: {
        id: policy.id,
        name: policy.name,
        keywords: policy.keywords
      },
      insights,
      statistics: {
        totalArticles,
        sentimentDistribution,
        trendChange: Math.round(trendChange * 100) / 100,
        period: `최근 ${days}일`
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI 인사이트 생성 실패:', error.message);
    res.status(500).json({
      success: false,
      error: 'AI 인사이트 생성 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 전체 정책 목록 조회
router.get('/policies', async (req, res) => {
  try {
    const policies = await MonitoringPolicy.findAll({
      where: { status: 'active' },
      order: [['created_at', 'DESC']]
    });

    // policy id가 1인 정책을 맨 앞으로 정렬
    const sortedPolicies = policies.sort((a, b) => {
      if (a.id === 1) return -1;
      if (b.id === 1) return 1;
      return 0;
    });

    res.json({
      success: true,
      policies: sortedPolicies.map(policy => ({
        id: policy.id,
        name: policy.name,
        keywords: policy.keywords,
        description: policy.description,
        status: policy.status,
        createdAt: policy.created_at
      }))
    });

  } catch (error) {
    console.error('❌ 정책 목록 조회 실패:', error.message);
    res.status(500).json({
      success: false,
      error: '정책 목록 조회 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

/**
 * AI 인사이트 생성 함수
 */
function generateInsights(policy, stats) {
  const insights = [];
  const { totalArticles, sentimentDistribution, trendChange, days } = stats;

  // 긍정적 트렌드 분석
  const positiveRatio = totalArticles > 0 ? 
    (sentimentDistribution.positive.count / totalArticles * 100) : 0;
  const negativeRatio = totalArticles > 0 ? 
    (sentimentDistribution.negative.count / totalArticles * 100) : 0;

  // 언급량 변화 인사이트
  if (Math.abs(trendChange) > 20) {
    insights.push({
      type: trendChange > 0 ? 'positive' : 'warning',
      title: `${policy.name} 언급량 ${trendChange > 0 ? '증가' : '감소'}`,
      content: `${policy.name} 관련 언급이 이전 ${days}일 대비 ${Math.abs(trendChange).toFixed(1)}% ${trendChange > 0 ? '증가' : '감소'}했습니다. ${
        trendChange > 0 ? '관심도가 높아지고 있어 모니터링을 강화하는 것이 좋겠습니다.' : 
        '관심도가 낮아지고 있어 적극적인 소통이 필요할 수 있습니다.'
      }`
    });
  }

  // 감성 분석 인사이트
  if (positiveRatio > 60) {
    insights.push({
      type: 'positive',
      title: '긍정적 여론 형성',
      content: `${policy.name} 관련 언급의 ${positiveRatio.toFixed(1)}%가 긍정적 감성을 보이고 있습니다. 현재 정책이 시민들에게 좋은 반응을 얻고 있는 것으로 보입니다.`
    });
  } else if (negativeRatio > 50) {
    insights.push({
      type: 'danger',
      title: '부정적 여론 주의',
      content: `${policy.name} 관련 언급의 ${negativeRatio.toFixed(1)}%가 부정적 감성을 보이고 있습니다. 시민 소통 강화와 정책 개선 방안 검토가 필요해 보입니다.`
    });
  } else if (negativeRatio > 30) {
    insights.push({
      type: 'warning',
      title: '여론 모니터링 필요',
      content: `${policy.name} 관련 부정적 언급이 ${negativeRatio.toFixed(1)}%를 차지하고 있습니다. 지속적인 모니터링과 선제적 대응이 필요합니다.`
    });
  }

  // 키워드별 특화 인사이트
  const keywordInsights = generateKeywordSpecificInsights(policy.keywords, policy.name);
  insights.push(...keywordInsights);

  // 기본 인사이트가 없는 경우
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      title: '안정적 여론 상태',
      content: `${policy.name} 관련 여론이 안정적인 상태를 유지하고 있습니다. 지속적인 모니터링을 통해 변화를 주시하고 있습니다.`
    });
  }

  return insights;
}

/**
 * 키워드별 특화 인사이트 생성
 */
function generateKeywordSpecificInsights(keywords, policyName) {
  const insights = [];

  // 수질 관련 키워드
  const waterQualityKeywords = ['수질', '정수', '수돗물', '물맛', '오염'];
  if (keywords.some(k => waterQualityKeywords.includes(k))) {
    insights.push({
      type: 'info',
      title: '수질 관리 지속 모니터링',
      content: '수질 관련 키워드가 포함된 정책입니다. 시민들의 수질에 대한 관심이 높으므로 투명한 정보 공개와 지속적인 품질 개선이 중요합니다.'
    });
  }

  // 요금 관련 키워드
  const feeKeywords = ['요금', '과금', '납부', '고지서'];
  if (keywords.some(k => feeKeywords.includes(k))) {
    insights.push({
      type: 'warning',
      title: '요금 관련 소통 강화 필요',
      content: '요금 관련 키워드가 포함된 정책입니다. 요금 변동이나 정책 변화 시 사전 공지와 충분한 설명이 필요합니다.'
    });
  }

  // 서비스 중단 관련 키워드
  const serviceKeywords = ['단수', '공사', '누수', '수리', '복구'];
  if (keywords.some(k => serviceKeywords.includes(k))) {
    insights.push({
      type: 'info',
      title: '서비스 연속성 관리',
      content: '서비스 중단 관련 키워드가 포함된 정책입니다. 사전 공지와 신속한 복구, 대체 서비스 제공이 시민 만족도에 큰 영향을 미칩니다.'
    });
  }

  return insights;
}

module.exports = router;
