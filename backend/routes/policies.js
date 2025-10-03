/**
 * 모니터링 정책 관리 API 라우트
 */

const express = require('express');
const router = express.Router();
const MonitoringPolicy = require('../models/MonitoringPolicy');
const { Op } = require('sequelize');

// 모든 정책 조회
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let whereClause = {};
    
    // 상태 필터
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    // 검색 필터
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const policies = await MonitoringPolicy.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: policies,
      count: policies.length
    });
  } catch (error) {
    console.error('정책 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '정책 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 활성화된 정책만 조회
router.get('/active', async (req, res) => {
  try {
    const policies = await MonitoringPolicy.findAll({
      where: { status: 'active' },
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: policies,
      count: policies.length
    });
  } catch (error) {
    console.error('활성 정책 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '활성 정책 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 특정 정책 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const policy = await MonitoringPolicy.findByPk(id);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: '정책을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: policy
    });
  } catch (error) {
    console.error('정책 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '정책 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 새 정책 생성
router.post('/', async (req, res) => {
  try {
    const { name, keywords, operator, description, status } = req.body;
    
    // 입력값 검증
    if (!name || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        message: '정책 이름과 키워드는 필수입니다.'
      });
    }
    
    // 중복 이름 확인
    const existingPolicy = await MonitoringPolicy.findOne({ where: { name } });
    if (existingPolicy) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 정책 이름입니다.'
      });
    }
    
    const policy = await MonitoringPolicy.create({
      name,
      keywords: keywords.filter(k => k.trim()), // 빈 키워드 제거
      operator: operator || 'OR',
      description,
      status: status || 'active',
      created_by: 'system' // 추후 사용자 인증 시 실제 사용자로 변경
    });
    
    res.status(201).json({
      success: true,
      data: policy,
      message: '정책이 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('정책 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '정책 생성 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 정책 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, keywords, operator, description, status } = req.body;
    
    const policy = await MonitoringPolicy.findByPk(id);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: '정책을 찾을 수 없습니다.'
      });
    }
    
    // 이름 중복 확인 (자신 제외)
    if (name && name !== policy.name) {
      const existingPolicy = await MonitoringPolicy.findOne({ 
        where: { 
          name,
          id: { [Op.ne]: id }
        } 
      });
      if (existingPolicy) {
        return res.status(400).json({
          success: false,
          message: '이미 존재하는 정책 이름입니다.'
        });
      }
    }
    
    // 정책 업데이트
    await policy.update({
      name: name || policy.name,
      keywords: keywords ? keywords.filter(k => k.trim()) : policy.keywords,
      operator: operator || policy.operator,
      description: description !== undefined ? description : policy.description,
      status: status || policy.status
    });
    
    res.json({
      success: true,
      data: policy,
      message: '정책이 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('정책 수정 실패:', error);
    res.status(500).json({
      success: false,
      message: '정책 수정 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 정책 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const policy = await MonitoringPolicy.findByPk(id);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: '정책을 찾을 수 없습니다.'
      });
    }
    
    await policy.destroy();
    
    res.json({
      success: true,
      message: '정책이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('정책 삭제 실패:', error);
    res.status(500).json({
      success: false,
      message: '정책 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 정책 상태 토글
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const policy = await MonitoringPolicy.findByPk(id);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: '정책을 찾을 수 없습니다.'
      });
    }
    
    const newStatus = policy.status === 'active' ? 'inactive' : 'active';
    await policy.update({ status: newStatus });
    
    res.json({
      success: true,
      data: policy,
      message: `정책이 ${newStatus === 'active' ? '활성화' : '비활성화'}되었습니다.`
    });
  } catch (error) {
    console.error('정책 상태 변경 실패:', error);
    res.status(500).json({
      success: false,
      message: '정책 상태 변경 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;
