import mysql from 'mysql2/promise';

// 커넥션 풀은 서버 프로세스당 1회만 생성 (Next.js 핫리로드 대비 전역 캐싱)
let pool = global.__mysqlPool;

if (!pool) {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // 대량 결과로 인한 메모리 문제 방지
    maxIdle: 10,
    idleTimeout: 60000,
    dateStrings: true,
  });
  global.__mysqlPool = pool;
}

/**
 * 파라미터 바인딩 쿼리 실행 (SQL Injection 방지 필수 패턴)
 * @param {string} sql - '?' 플레이스홀더를 사용한 쿼리
 * @param {Array} params
 */
export async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    // 원본 DB 에러(테이블/컬럼 구조 노출)는 로그로만 남기고 클라이언트엔 일반화된 에러 전달
    console.error('[DB ERROR]', err.message);
    throw new Error('DB_QUERY_FAILED');
  }
}

/**
 * 트랜잭션이 필요한 작업용 헬퍼
 */
export async function withTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export default pool;
