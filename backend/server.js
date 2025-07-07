const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// 라우터 가져오기
const monitoringRoutes = require('./routes/monitoring');

// 라우터 설정
app.use('/api/monitoring', monitoringRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: '수크랩 백엔드 API 서버',
    version: '1.0.0',
    endpoints: {
      monitoring: '/api/monitoring',

    }
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📡 프론트엔드: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔗 API 엔드포인트: http://localhost:${PORT}/api`);
}); 