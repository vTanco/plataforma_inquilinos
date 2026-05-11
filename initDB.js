import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  console.log('Conectando a Neon para crear tablas...');
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('tenant', 'technician')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS technician_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        service_category VARCHAR(100) NOT NULL,
        phone VARCHAR(50),
        description TEXT,
        rating DECIMAL(3,2) DEFAULT 0.0,
        reviews_count INT DEFAULT 0
      );
    `);

    // In case the table already existed, add the new columns
    await pool.query(`
      ALTER TABLE technician_profiles 
      ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS reviews_count INT DEFAULT 0;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        technician_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        service_category VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        appointment_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        signature TEXT
      );
    `);

    console.log('¡Tablas creadas correctamente en Neon!');
  } catch (err) {
    console.error('Error creando tablas:', err);
  } finally {
    await pool.end();
  }
}

initDB();
