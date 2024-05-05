const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const conn = require('../DB');
const dotenv = require('dotenv');

// JSON 형태의 본문을 파싱할 수 있도록 설정
router.use(express.json());

// URL 인코딩된 데이터를 파싱할 수 있도록 설정
router.use(express.urlencoded({ extended: true }));

dotenv.config();

router.get('/', (req, res) => {
  res.json({
    message: 'result!'
  });
});

// 카카오 로그인
router.post('/api/login/kakao', (req, res) => {
  const accessToken = req.headers.authorization; // 헤더에서 토큰 추출
  const { email, name } = req.body;
  
  // 회원 정보 조회
  const SQL = `SELECT * FROM users WHERE email = ?`;
  conn.query(SQL, email, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(400).end();
    }

    const loginUser = results[0];

    // 회원 정보가 있는 경우
    if (loginUser) {
      // 토큰 발급
      const token = generateToken(email, name);
      res.header('Authorization', `Bearer ${token}`);
      res.status(200).json({
        message: `${name}님 로그인 되었습니다.`
      });
    } else { // 회원정보가 DB에 없는 경우
      const userInfo = [email, name];
      const insertSQL = `INSERT INTO users (email, name) VALUES (?, ?)`;

      // 새로운 사용자 정보 DB에 추가
      conn.query(insertSQL, userInfo, (err, results) => {
        if (err) {
          console.error(err);
          return res.status(400).end();
        }

        // 토큰 발급
        const token = generateToken(email, name);
        res.header('Authorization', `Bearer ${token}`);
        res.status(200).json({
          message: `${name}님 처음 방문하셨군요.`
        });
      });
    }
  });
});

// 토큰을 생성
function generateToken(email, name) {
  return jwt.sign({
    email: email,
    name: name
  }, process.env.PRIVATE_KEY, {
    expiresIn: '24h',
    issuer: "myosa"
  });
}

module.exports = router;
