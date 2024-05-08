const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const conn = require('../../db');
// const conn = require('../DB');
const { body, params, validationResult } = require('express-validator');
const dotenv = require('dotenv');

// JSON 형태의 본문을 파싱할 수 있도록 설정
router.use(express.json());

// URL 인코딩된 데이터를 파싱할 수 있도록 설정
router.use(express.urlencoded({ extended: true }));

dotenv.config();

const validate = (req, res, next) => {
  const err = validationResult(req)

  if(err.isEmpty()) {
    return next()
  } else {
    return res.status(400).json(err.array())
  }
}

// 로그인
router.post(
  '/signin',
  [
    body('email').notEmpty().isEmail().withMessage('이메일 확인 필요'),
    body('password').notEmpty().isString().withMessage('비밀번호 확인 필요'),
    validate
  ],
  (req, res) => {
    const { email, password } = req.body

    let SQL = `SELECT * FROM users WHERE email = ?`
    conn.query(SQL, email,
      function (err, results) {
        if(err) {
          console.log(err)
          return res.status(400).end()
        }

        var loginUser = results[0]

        if (loginUser && loginUser.password == password)  {
            // token 발급
            const token = jwt.sign({
              email: loginUser.email,
              name : loginUser.name
            }, process.env.PRIVATE_KEY, {
              expiresIn : '24h',
              issuer: "myosa"
            });

            res.cookie("token", token, {httpOnly:true});
            res.status(200).json({
              message: `${loginUser.name}님 로그인 되었습니다.`
            })
        } else
          res.status(403).json({
            message: "이메일 또는 비밀번호가 틀렸습니다."
          })
      }
    );
})

// 회원가입
router.post(
  '/signup',
  [
    body('email').notEmpty().isEmail().withMessage('이메일 확인 필요'),
    body('name').notEmpty().isString().withMessage('이름 확인 필요'),
    body('password').notEmpty().isString().withMessage('비밀번호 확인 필요'),
    body('contact').notEmpty().isString().withMessage('연락처 확인 필요'),
    validate
  ],
  (req, res) => {
    const { email, password, name, contact } = req.body

    let SQL = `SELECT * FROM users WHERE email = ?` // db에서 회원조회 
    conn.query(SQL, email,
      function (err, results) {
        if(err) {
          console.log(err)
          return res.status(400).end()
        }

        var loginUser = results[0]

        if (loginUser)  { // 존재하면
          res.status(403).json({
            message: "이미 존재하는 회원입니다."
          })
        } else { // 존재하지 않으면 정보 추가
          let SQL = `INSERT INTO users (email, name, password, contact) VALUES (?, ?, ?, ?)`
          let values = [email, name, password, contact]
          conn.query(SQL, values,
            function (err, results) {
              if(err) {
                console.log(err)
                return res.status(400).end()
              }
              res.status(201).json(results)
            }
          )
        }
      }
    );
})

module.exports = router;