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

// 정책 전체 조회
router.get('/', (req, res) => {
  let SQL = `SELECT * FROM policy`;
  conn.query(SQL, function (err, results) {
    if (err) {
      console.error(err); // Log the error
      return res.status(400).json({ error: "Database query failed" }); // Provide a JSON error message
    }

    if (results) {
      res.status(200).json(results); // Use HTTP 200 for successful data retrieval
    } else {
      res.status(404).json({ message: 'No policies found' }); // Handle case where no data is returned
    }
  });
});


// 정책 개별 조회
router.get('/:key', (req, res) => {
  const { key } = req.params;

  let SQL = `SELECT * FROM policy WHERE \`key\` = ?`;
  let SQL1 = `SELECT * FROM policy_content WHERE \`key\` = ?`;

  // 첫 번째 쿼리 실행
  conn.query(SQL, [key], function (err, results) {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: "Database query failed" });
    }

    if (results.length > 0) {
      // 첫 번째 쿼리의 결과가 존재하면 두 번째 쿼리 실행
      const policyData = results[0];

      conn.query(SQL1, [key], function (err, contentResults) {
        if (err) {
          console.error(err);
          return res.status(400).json({ error: "Database query failed" });
        }

        // 두 쿼리 결과 합치기
        if (contentResults.length > 0) {
          const combinedResults = {
            ...policyData,
            content: contentResults[0]
          };

          res.status(200).json(combinedResults);
        } else {
          res.status(404).json({ message: 'No content found for provided key' });
        }
      });
    } else {
      res.status(404).json({ message: 'No policy found with provided key' });
    }
  });
});

module.exports = router;