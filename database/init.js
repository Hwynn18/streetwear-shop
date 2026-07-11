// 스키마 적용 + 최초 관리자 계정 생성 스크립트
// 실행: node database/init.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true, // 스키마 파일 실행 시에만 사용, 서비스 쿼리에서는 절대 사용 금지
  });

  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schema);
    console.log('✅ 스키마 적용 완료');

    const [rows] = await connection.query(
      'SELECT id FROM streetwear_shop.users WHERE role = "admin" LIMIT 1'
    );

    if (rows.length === 0) {
      const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
      await connection.query(
        `INSERT INTO streetwear_shop.users (username, password_hash, name, phone, email, role)
         VALUES (?, ?, ?, ?, ?, 'admin')`,
        ['admin', passwordHash, '관리자', '010-0000-0000', 'admin@example.com']
      );
      console.log('✅ 관리자 계정 생성 완료 (username: admin / password: ChangeMe123!)');
      console.log('⚠️  운영 전 반드시 비밀번호를 변경하세요.');
    }
  } catch (err) {
    console.error('❌ 초기화 실패:', err.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

main();
