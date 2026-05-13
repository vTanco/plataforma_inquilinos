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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test DB connection and run migrations
pool.connect(async (err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Connected to Neon PostgreSQL database');
    try {
      await client.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS signature TEXT;');
      await client.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pdf_document TEXT;');
      await client.query('ALTER TABLE technician_profiles ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(6,2) DEFAULT 30.0;');
      console.log('Migrations executed successfully');
    } catch (migErr) {
      console.error('Migration failed', migErr);
    }
    release();
  }
});

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_in_production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '105035380421-9jcph3rp9qug6d4slbrlledptjm2er90.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// API Routes
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  
  if (!credential) {
    return res.status(400).json({ error: 'Falta credencial de Google.' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    
    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length > 0) {
      // User exists -> Login
      const user = userResult.rows[0];
      delete user.password_hash;
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ user, token });
    } else {
      // User does not exist -> Send back requireSetup with pre-filled info
      return res.status(202).json({ requireSetup: true, email, name, message: 'Falta completar perfil' });
    }
  } catch (err) {
    console.error('Error verifying Google token:', err);
    res.status(401).json({ error: 'Token de Google inválido.' });
  }
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Register (Tenant or Technician)
app.post('/api/auth/register', async (req, res) => {
  let { name, email, password, role, service_category, phone, description, latitude, longitude, credential, hourly_rate } = req.body;
  
  if (credential) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      name = payload.name;
      email = payload.email;
      password = Math.random().toString(36).slice(-10); // Random password since they use Google
    } catch (err) {
      return res.status(401).json({ error: 'Token de Google inválido.' });
    }
  }

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
        'INSERT INTO technician_profiles (user_id, service_category, phone, description, hourly_rate) VALUES ($1, $2, $3, $4, $5)',
        [newUser.id, service_category, phone, description, hourly_rate || 30.0]
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
        SELECT u.id, u.name, t.service_category, t.description, t.rating, t.reviews_count, t.hourly_rate,
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

app.get('/api/technicians/:id/appointments', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT appointment_date FROM appointments WHERE technician_id = $1',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching technician appointments' });
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
    console.error('Error in /api/appointments:', err);
    res.status(500).json({ error: 'Error creating appointment', details: err.message });
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

app.patch('/api/appointments/:id/cancel', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    let query = '';
    if (req.user.role === 'tenant') {
      query = "UPDATE appointments SET status = 'cancelled' WHERE id = $1 AND tenant_id = $2 RETURNING *";
    } else {
      query = "UPDATE appointments SET status = 'cancelled' WHERE id = $1 AND technician_id = $2 RETURNING *";
    }
    const result = await pool.query(query, [id, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada o no autorizada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    res.status(500).json({ error: 'Error cancelando la cita' });
  }
});

// Serve static files in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'dist')));
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
