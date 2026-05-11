import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addPdfColumn() {
  console.log('Añadiendo columna pdf_document a appointments...');
  try {
    await pool.query(`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS pdf_document TEXT;
    `);
    console.log('¡Columna añadida correctamente!');
  } catch (err) {
    console.error('Error alterando tabla:', err);
  } finally {
    await pool.end();
  }
}

addPdfColumn();
