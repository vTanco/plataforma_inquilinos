import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test DB connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Connected to Neon PostgreSQL database');
    release();
  }
});

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_in_production';

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Register (Tenant or Technician)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, service_category, phone, description, latitude, longitude } = req.body;
  
  if (!name || !email || !password || !role || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Faltan campos obligatorios, incluyendo la ubicación.' });
  }
  
  if (role !== 'tenant' && role !== 'technician') {
    return res.status(400).json({ error: 'Rol inválido.' });
  }

  try {
    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const newUserResult = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, latitude, longitude',
      [name, email, password_hash, role, latitude, longitude]
    );
    const newUser = newUserResult.rows[0];

    // If technician, insert profile
    if (role === 'technician') {
      if (!service_category) {
        return res.status(400).json({ error: 'Falta categoría de servicio para el técnico.' });
      }
      await pool.query(
        'INSERT INTO technician_profiles (user_id, service_category, phone, description) VALUES ($1, $2, $3, $4)',
        [newUser.id, service_category, phone, description]
      );
    }

    // Generate Token
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error('Error in /api/auth/register', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    // Do not send hash back
    delete user.password_hash;

    res.json({ user, token });
  } catch (err) {
    console.error('Error in /api/auth/login', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/api/technicians', authenticateToken, async (req, res) => {
  const { category } = req.query;
  try {
    // 1. Get the current user's location
    const userRes = await pool.query('SELECT latitude, longitude FROM users WHERE id = $1', [req.user.id]);
    const userLocation = userRes.rows[0];

    if (!userLocation || userLocation.latitude == null || userLocation.longitude == null) {
      return res.status(400).json({ error: 'Ubicación del usuario no encontrada. No se pueden calcular distancias.' });
    }

    const { latitude, longitude } = userLocation;

    // 2. Query technicians in a 30km radius
    let query = `
      SELECT * FROM (
        SELECT u.id, u.name, t.service_category, t.description, t.rating, t.reviews_count,
        ( 6371 * acos( cos( radians($1) ) * cos( radians( u.latitude ) ) 
        * cos( radians( u.longitude ) - radians($2) ) + sin( radians($1) ) 
        * sin( radians( u.latitude ) ) ) ) AS distance
        FROM users u 
        JOIN technician_profiles t ON u.id = t.user_id
        WHERE t.service_category = $3
      ) as loc
      WHERE distance <= 30
      ORDER BY distance ASC
    `;
    
    const result = await pool.query(query, [latitude, longitude, category]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching technicians' });
  }
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
  const { technician_id, service_category, appointment_date, signature, pdf_document } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO appointments (tenant_id, technician_id, service_category, appointment_date, signature, pdf_document) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, technician_id, service_category, appointment_date, signature, pdf_document]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating appointment' });
  }
});

app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    let query = '';
    if (req.user.role === 'tenant') {
      query = 'SELECT a.*, u.name as other_party_name FROM appointments a JOIN users u ON a.technician_id = u.id WHERE a.tenant_id = $1 ORDER BY a.appointment_date DESC';
    } else {
      query = 'SELECT a.*, u.name as other_party_name FROM appointments a JOIN users u ON a.tenant_id = u.id WHERE a.technician_id = $1 ORDER BY a.appointment_date DESC';
    }
    const result = await pool.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

// Serve static files in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
