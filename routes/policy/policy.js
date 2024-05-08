const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const conn = require('../DB');
const { body, params, validationResult } = require('express-validator');
const dotenv = require('dotenv');

// JSON 형태의 본문을 파싱할 수 있도록 설정
router.use(express.json());

// URL 인코딩된 데이터를 파싱할 수 있도록 설정
router.use(express.urlencoded({ extended: true }));

dotenv.config();


module.exports = router;