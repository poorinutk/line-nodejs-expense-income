// ✅ ปรับให้ใช้ connection pool แทน client เดี่ยว
const { Pool } = require('pg');

const pool = new Pool({
  user: 'kpurinut',
  host: 'localhost',
  database: 'testdb',
  password: '123456',
  port: 5432,
});

// ไม่ต้อง connect แบบ manual เพราะ Pool จะจัดการให้

async function runQuery(query, params, callback) {
  const client = await pool.connect();
  try {
    console.log('เชื่อมต่อสำเร็จ (ผ่าน pool)');
    console.log('params: ',params);
    const res = await client.query(query, params);
    callback(null, res.rows); // ส่งผลลัพธ์กลับผ่าน callback
  } catch (err) {
    console.error('Query Error:', err);
    callback(err, null); // ส่ง error กลับ
  } finally {
    client.release(); // คืน connection ให้ pool (ไม่ใช่ end!)
    console.log('คืน connection ให้ pool แล้ว');
  }
}

module.exports = {
  runQuery
};
