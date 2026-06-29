import pg from "pg";
import "dotenv/config";

async function test() {
  const connectionString = process.env.DATABASE_URL;
  console.log("Testing connection to:", connectionString ? "URL present" : "URL missing");
  
  console.log("Test 1: Without explicit SSL config in Pool...");
  try {
    const pool = new pg.Pool({ connectionString });
    const res = await pool.query("SELECT NOW()");
    console.log("Test 1 Success:", res.rows[0]);
    await pool.end();
  } catch (e: any) {
    console.error("Test 1 Failed:", e.message);
  }

  console.log("Test 2: With explicit SSL config...");
  try {
    const pool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    const res = await pool.query("SELECT NOW()");
    console.log("Test 2 Success:", res.rows[0]);
    await pool.end();
  } catch (e: any) {
    console.error("Test 2 Failed:", e.message);
  }
}

test();
