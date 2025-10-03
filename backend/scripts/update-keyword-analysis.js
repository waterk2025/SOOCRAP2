/**
 * 기존 기사들의 keyword_analysis 업데이트 스크립트
 * 이미 저장된 기사들에 대해 키워드 중요도 분석을 수행하고 저장
 */

const { sequelize } = require('../config/database');
const Article = require('../models/Article');

// 키워드 중요도 분석 함수 (news-collector.js에서 복사)
function analyzeKeywordImportance(title, content, keywords) {
  const fullText = `${title || ''} ${content || ''}`.toLowerCase();
  const titleText = (title || '').toLowerCase();
  
  return keywords.map(keyword => {
    const keywordLower = keyword.toLowerCase();
    
    // 제목에 있으면 가중치 높음
    const inTitle = titleText.includes(keywordLower);
    
    // 전체 텍스트에서 언급 횟수
    const mentions = (fullText.match(new RegExp(keywordLower, 'g')) || []).length;
    
    // 중요도 점수 계산 (제목: 3점, 본문 언급: 1점씩)
    const importance = (inTitle ? 3 : 0) + mentions;
    
    return {
      keyword,
      mentions,
      inTitle,
      importance
    };
  }).sort((a, b) => b.importance - a.importance);
}

async function updateKeywordAnalysis() {
  try {
    console.log('🔄 기존 기사들의 keyword_analysis 업데이트 시작...');
    
    // 1. 데이터베이스 연결 확인
    await sequelize.authenticate();
    console.log('✅ 데이터베이스 연결 확인');
    
    // 2. keyword_analysis가 null인 기사들 조회
    const articlesWithoutAnalysis = await Article.findAll({
      where: {
        keyword_analysis: null,
        keywords: {
          [require('sequelize').Op.ne]: null
        }
      },
      attributes: ['id', 'title', 'content', 'keywords'],
      order: [['created_at', 'DESC']]
    });
    
    console.log(`📊 업데이트 대상 기사: ${articlesWithoutAnalysis.length}개`);
    
    if (articlesWithoutAnalysis.length === 0) {
      console.log('✅ 업데이트할 기사가 없습니다.');
      return;
    }
    
    // 3. 배치 단위로 처리
    const batchSize = 100;
    let processedCount = 0;
    let updatedCount = 0;
    
    for (let i = 0; i < articlesWithoutAnalysis.length; i += batchSize) {
      const batch = articlesWithoutAnalysis.slice(i, i + batchSize);
      
      console.log(`🔄 배치 처리 중... (${i + 1}-${Math.min(i + batchSize, articlesWithoutAnalysis.length)}/${articlesWithoutAnalysis.length})`);
      
      // 배치 내 각 기사 처리
      for (const article of batch) {
        try {
          // 키워드가 있는 경우에만 분석
          if (article.keywords && Array.isArray(article.keywords) && article.keywords.length > 0) {
            const keywordAnalysis = analyzeKeywordImportance(
              article.title,
              article.content,
              article.keywords
            );
            
            // 데이터베이스 업데이트
            await article.update({
              keyword_analysis: keywordAnalysis
            });
            
            updatedCount++;
          }
          
          processedCount++;
          
          // 진행률 표시
          if (processedCount % 50 === 0) {
            const progress = Math.round((processedCount / articlesWithoutAnalysis.length) * 100);
            console.log(`📈 진행률: ${progress}% (${processedCount}/${articlesWithoutAnalysis.length})`);
          }
          
        } catch (error) {
          console.error(`❌ 기사 ID ${article.id} 업데이트 실패:`, error.message);
        }
      }
      
      // 배치 간 잠시 대기 (데이터베이스 부하 방지)
      if (i + batchSize < articlesWithoutAnalysis.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ keyword_analysis 업데이트 완료:`);
    console.log(`   - 처리된 기사: ${processedCount}개`);
    console.log(`   - 업데이트된 기사: ${updatedCount}개`);
    
    // 4. 업데이트 결과 확인
    const remainingArticles = await Article.count({
      where: {
        keyword_analysis: null,
        keywords: {
          [require('sequelize').Op.ne]: null
        }
      }
    });
    
    console.log(`📊 남은 업데이트 대상: ${remainingArticles}개`);
    
    if (remainingArticles === 0) {
      console.log('🎉 모든 기사의 keyword_analysis 업데이트 완료!');
    }
    
  } catch (error) {
    console.error('❌ keyword_analysis 업데이트 실패:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  updateKeywordAnalysis()
    .then(() => {
      console.log('✅ 업데이트 성공');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 업데이트 실패:', error.message);
      process.exit(1);
    });
}

module.exports = { updateKeywordAnalysis };
