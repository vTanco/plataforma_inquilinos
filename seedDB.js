import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const technicians = [
  { name: 'Carlos Fontanero', email: 'carlos@fontaneria.com', role: 'technician', category: 'Fontanería', phone: '600111222', description: 'Especialista en desatascos y fugas. Más de 15 años de experiencia.', rating: 4.8, reviews: 120 },
  { name: 'Ana Tuberías', email: 'ana@fontaneria.com', role: 'technician', category: 'Fontanería', phone: '600222333', description: 'Instalaciones completas y reparaciones rápidas. Servicio 24h.', rating: 4.5, reviews: 85 },
  { name: 'Roberto Madera', email: 'roberto@carpinteria.com', role: 'technician', category: 'Carpintería', phone: '600333444', description: 'Muebles a medida y restauración de antigüedades.', rating: 4.9, reviews: 200 },
  { name: 'Lucía Ebanista', email: 'lucia@carpinteria.com', role: 'technician', category: 'Carpintería', phone: '600444555', description: 'Especialista en puertas, armarios empotrados y suelos de parquet.', rating: 4.7, reviews: 150 },
  { name: 'Jorge Chispas', email: 'jorge@electricidad.com', role: 'technician', category: 'Electricidad', phone: '600555666', description: 'Certificados eléctricos, revisión de cuadros y domótica.', rating: 4.6, reviews: 90 },
  { name: 'María Cables', email: 'maria@electricidad.com', role: 'technician', category: 'Electricidad', phone: '600666777', description: 'Solución a cortocircuitos e instalación de iluminación LED.', rating: 4.8, reviews: 110 },
  { name: 'Pedro Brocha', email: 'pedro@pintura.com', role: 'technician', category: 'Pintura', phone: '600777888', description: 'Alisado de paredes, pintura decorativa y estuco.', rating: 4.4, reviews: 60 },
  { name: 'Elena Colores', email: 'elena@pintura.com', role: 'technician', category: 'Pintura', phone: '600888999', description: 'Pintura de interiores y exteriores. Especialista en papel pintado.', rating: 4.9, reviews: 175 },
  { name: 'David Plantas', email: 'david@jardineria.com', role: 'technician', category: 'Jardinería', phone: '600999000', description: 'Diseño de jardines, poda de altura y mantenimiento.', rating: 4.7, reviews: 130 },
  { name: 'Laura Césped', email: 'laura@jardineria.com', role: 'technician', category: 'Jardinería', phone: '600000111', description: 'Instalación de riego automático y cuidado de plantas exóticas.', rating: 4.5, reviews: 95 },
  { name: 'Miguel Seco', email: 'miguel@humedades.com', role: 'technician', category: 'Humedades', phone: '600111333', description: 'Tratamientos definitivos contra la humedad por condensación y capilaridad.', rating: 4.8, reviews: 210 },
  { name: 'Sofía Impermeable', email: 'sofia@humedades.com', role: 'technician', category: 'Humedades', phone: '600222444', description: 'Impermeabilización de terrazas y reparación de filtraciones.', rating: 4.6, reviews: 105 },
];

async function seedDB() {
  console.log('Generando datos ficticios en Neon...');
  try {
    const password_hash = await bcrypt.hash('password123', 10);

    for (const tech of technicians) {
      // Check if exists
      const check = await pool.query('SELECT * FROM users WHERE email = $1', [tech.email]);
      if (check.rows.length === 0) {
        // Insert User
        const userRes = await pool.query(
          'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
          [tech.name, tech.email, password_hash, tech.role]
        );
        const userId = userRes.rows[0].id;

        // Insert Profile
        await pool.query(
          'INSERT INTO technician_profiles (user_id, service_category, phone, description, rating, reviews_count) VALUES ($1, $2, $3, $4, $5, $6)',
          [userId, tech.category, tech.phone, tech.description, tech.rating, tech.reviews]
        );
        console.log(`Técnico insertado: ${tech.name} (${tech.category})`);
      } else {
        console.log(`El técnico con email ${tech.email} ya existe. Saltando...`);
      }
    }
    
    // Add a dummy tenant for testing
    const tenantCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['inquilino@test.com']);
    if (tenantCheck.rows.length === 0) {
       await pool.query(
          'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
          ['Juan Inquilino', 'inquilino@test.com', password_hash, 'tenant']
       );
       console.log('Inquilino de prueba insertado: inquilino@test.com (password: password123)');
    }

    console.log('¡Base de datos poblada con éxito!');
  } catch (err) {
    console.error('Error insertando datos:', err);
  } finally {
    await pool.end();
  }
}

seedDB();
