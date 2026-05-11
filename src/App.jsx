import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Droplets, Zap, Paintbrush, TreePine, CloudRain, UserPlus, CalendarCheck } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  return (
    <nav className="nav-header">
      <Link to="/" className="nav-logo">
        <Home style={{ color: 'var(--primary)' }} />
        <span>Vecinos<span className="text-gradient">Connect</span></span>
      </Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Inicio</Link>
        <Link to="/services" className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}>Servicios</Link>
        <Link to="/technicians" className={`nav-link ${location.pathname === '/technicians' ? 'active' : ''}`}>Técnicos</Link>
        <Link to="/login" className="btn btn-outline" style={{ marginLeft: '16px' }}>Iniciar Sesión</Link>
        <Link to="/register" className="btn btn-primary">Registrarse</Link>
      </div>
    </nav>
  );
};

const HomePage = () => {
  const services = [
    { icon: <Droplets />, name: "Fontanería", desc: "Reparación de tuberías, grifos y fugas." },
    { icon: <Wrench />, name: "Carpintería", desc: "Muebles a medida, puertas y reparaciones de madera." },
    { icon: <Zap />, name: "Electricidad", desc: "Instalaciones, revisión de cuadros eléctricos y enchufes." },
    { icon: <Paintbrush />, name: "Pintura", desc: "Pintura de interiores, exteriores y alisado de paredes." },
    { icon: <TreePine />, name: "Jardinería", desc: "Mantenimiento de jardines, poda y riego." },
    { icon: <CloudRain />, name: "Humedades", desc: "Tratamientos anti-humedad y filtraciones." },
  ];

  return (
    <div className="page-container animate-fade-in">
      <div className="hero-section">
        <h1 className="hero-title">Tu Comunidad, <span className="text-gradient">Mejor Atendida</span></h1>
        <p className="hero-subtitle">
          La plataforma integral para inquilinos y técnicos. Contrata servicios para tu hogar o únete como profesional para ofrecer tu talento.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/services" className="btn btn-primary">Explorar Servicios</Link>
          <Link to="/technicians/register" className="btn btn-outline">Soy Técnico</Link>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <div className="flex-between">
          <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>Servicios Disponibles</h2>
          <Link to="/services" style={{ color: 'var(--text-muted)' }}>Ver todos &rarr;</Link>
        </div>
        
        <div className="services-grid stagger-1">
          {services.map((srv, idx) => (
            <div key={idx} className="glass-panel service-card">
              <div className="service-icon">
                {srv.icon}
              </div>
              <h3 className="service-title">{srv.name}</h3>
              <p className="service-desc">{srv.desc}</p>
              <button className="btn btn-outline" style={{ width: '100%' }}>Solicitar Presupuesto</button>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel stagger-2" style={{ marginTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '40px' }}>
        <div style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>¿Eres un profesional?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1.1rem' }}>
            Únete a nuestra red de técnicos de confianza. Date de alta, recibe solicitudes de trabajo de las comunidades de vecinos y gestiona tus citas fácilmente.
          </p>
          <ul style={{ listStyle: 'none', marginBottom: '32px', color: 'var(--text-muted)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <UserPlus size={20} style={{ color: 'var(--primary)' }} /> Perfil profesional personalizado
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <CalendarCheck size={20} style={{ color: 'var(--primary)' }} /> Gestión de agenda y citas
            </li>
          </ul>
          <Link to="/technicians/register" className="btn btn-primary">Crear cuenta de técnico</Link>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
           <div style={{ width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Wrench size={120} style={{ color: 'var(--primary)', opacity: 0.8 }} />
           </div>
        </div>
      </div>
    </div>
  );
};

import { Login, Register } from './pages/Auth';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<div className="page-container"><h2>Servicios (Próximamente)</h2></div>} />
        <Route path="/technicians" element={<div className="page-container"><h2>Técnicos (Próximamente)</h2></div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register role="tenant" />} />
        <Route path="/technicians/register" element={<Register role="technician" />} />
      </Routes>
    </Router>
  );
};

export default App;
