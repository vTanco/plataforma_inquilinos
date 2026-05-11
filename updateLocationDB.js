import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addLocationColumns() {
  console.log('Añadiendo columnas de ubicación a usuarios...');
  try {
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
      ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
    `);

    // Give dummy users a default location (e.g., center of Madrid)
    await pool.query(`
      UPDATE users SET latitude = 40.4168, longitude = -3.7038 WHERE latitude IS NULL;
    `);

    // Give some technicians a location slightly outside Madrid (e.g. 10km away) 
    // to test radius, and maybe one far away (50km)
    // 40.5000, -3.7000 is ~10km away.
    // 41.0000, -3.7000 is ~65km away.
    await pool.query(`
      UPDATE users SET latitude = 41.0000, longitude = -3.7038 WHERE id % 3 = 0;
    `);

    console.log('¡Columnas añadidas correctamente!');
  } catch (err) {
    console.error('Error alterando tabla:', err);
  } finally {
    await pool.end();
  }
}

addLocationColumns();
