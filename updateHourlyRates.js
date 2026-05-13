import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateHourlyRates() {
  console.log('Actualizando tarifas por hora en la base de datos Neon...');
  try {
    // Check if the column exists first by attempting to query it
    // Then assign random rates to existing technicians
    const result = await pool.query('SELECT id FROM technician_profiles');
    for (const row of result.rows) {
      const randomRate = (Math.random() * (50 - 20) + 20).toFixed(2);
      await pool.query('UPDATE technician_profiles SET hourly_rate = $1 WHERE id = $2', [randomRate, row.id]);
    }
    console.log('¡Tarifas actualizadas correctamente!');
  } catch (err) {
    console.error('Error actualizando tarifas:', err);
  } finally {
    await pool.end();
  }
}

updateHourlyRates();
