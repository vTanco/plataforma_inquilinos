import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Wrench, Droplets, Zap, Paintbrush, TreePine, CloudRain, UserPlus, CalendarCheck, LogOut } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

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
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '16px' }}>
            <Link to="/dashboard" className="btn btn-primary">Mi Panel</Link>
            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              <LogOut size={16} /> Salir
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline" style={{ marginLeft: '16px' }}>Iniciar Sesión</Link>
            <Link to="/register" className="btn btn-primary">Registrarse</Link>
          </>
        )}
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

  const stats = [
    { value: 2500, suffix: '+', label: 'Servicios completados' },
    { value: 150, suffix: '+', label: 'Técnicos verificados' },
    { value: 98, suffix: '%', label: 'Clientes satisfechos' },
    { value: 24, suffix: 'h', label: 'Tiempo medio de respuesta' },
  ];

  const steps = [
    { num: '01', title: 'Describe tu problema', desc: 'Selecciona el tipo de servicio que necesitas y describe los detalles del trabajo.' },
    { num: '02', title: 'Elige tu técnico', desc: 'Compara perfiles, valoraciones y tarifas de profesionales cercanos a tu zona.' },
    { num: '03', title: 'Agenda tu cita', desc: 'Selecciona el día y hora que mejor te convenga en tiempo real.' },
    { num: '04', title: 'Paga de forma segura', desc: 'Realiza el pago con PayPal después de que el técnico acepte tu solicitud.' },
  ];

  const [scrollY, setScrollY] = React.useState(0);
  const [visibleSections, setVisibleSections] = React.useState({});
  const [counters, setCounters] = React.useState(stats.map(() => 0));
  const [countersStarted, setCountersStarted] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('[data-scroll]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (visibleSections['stats-section'] && !countersStarted) {
      setCountersStarted(true);
      stats.forEach((stat, i) => {
        let start = 0;
        const end = stat.value;
        const duration = 2000;
        const stepTime = duration / end;
        const timer = setInterval(() => {
          start += Math.ceil(end / 60);
          if (start >= end) { start = end; clearInterval(timer); }
          setCounters(prev => { const n = [...prev]; n[i] = start; return n; });
        }, stepTime);
      });
    }
  }, [visibleSections]);

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Floating 3D orbs */}
      <div className="orb orb-1" style={{ transform: `translate3d(${scrollY * 0.05}px, ${scrollY * -0.08}px, 0)` }}></div>
      <div className="orb orb-2" style={{ transform: `translate3d(${scrollY * -0.04}px, ${scrollY * -0.06}px, 0)` }}></div>
      <div className="orb orb-3" style={{ transform: `translate3d(${scrollY * 0.03}px, ${scrollY * -0.04}px, 0)` }}></div>

      {/* HERO */}
      <section className="hero-full" style={{ transform: `translateY(${scrollY * 0.3}px)`, opacity: Math.max(0, 1 - scrollY / 700) }}>
        <div className="hero-content">
          <div className="hero-badge">🏠 Plataforma #1 en servicios del hogar</div>
          <h1 className="hero-title-xl">
            Tu Comunidad,<br/><span className="text-gradient-xl">Mejor Atendida</span>
          </h1>
          <p className="hero-sub-xl">
            Conectamos inquilinos con los mejores técnicos profesionales de tu zona. Contrata, gestiona y paga servicios para tu hogar de forma segura y transparente.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Empezar Ahora</Link>
            <Link to="/technicians/register" className="btn btn-outline btn-lg">Soy Profesional</Link>
          </div>
          <div className="scroll-indicator">
            <span>Desliza para descubrir</span>
            <div className="scroll-arrow"></div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats-section" data-scroll className={`stats-strip ${visibleSections['stats-section'] ? 'visible' : ''}`}>
        {stats.map((stat, i) => (
          <div key={i} className="stat-item">
            <span className="stat-value">{counters[i]}{stat.suffix}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS - Scrollytelling */}
      <section id="how-section" data-scroll className="page-container" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
        <div className={`section-header ${visibleSections['how-section'] ? 'visible' : ''}`}>
          <span className="section-tag">¿Cómo funciona?</span>
          <h2 className="section-title">Cuatro pasos para tu <span className="text-gradient">tranquilidad</span></h2>
        </div>
        <div className="steps-timeline">
          {steps.map((step, i) => (
            <div key={i} id={`step-${i}`} data-scroll className={`step-card ${visibleSections[`step-${i}`] ? 'visible' : ''}`} style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="step-num">{step.num}</div>
              <div className="step-line"></div>
              <div className="step-body">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services-section" data-scroll className="page-container" style={{ paddingBottom: '120px' }}>
        <div className={`section-header ${visibleSections['services-section'] ? 'visible' : ''}`}>
          <span className="section-tag">Nuestros Servicios</span>
          <h2 className="section-title">Todo lo que tu hogar <span className="text-gradient">necesita</span></h2>
        </div>
        <div className="services-grid-new">
          {services.map((srv, idx) => (
            <div key={idx} id={`srv-${idx}`} data-scroll className={`service-card-new ${visibleSections[`srv-${idx}`] ? 'visible' : ''}`} style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="service-icon-new">{srv.icon}</div>
              <h3 className="service-title-new">{srv.name}</h3>
              <p className="service-desc-new">{srv.desc}</p>
              <Link to="/register" className="service-link">Solicitar →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA TECHNICIAN */}
      <section id="cta-section" data-scroll className={`cta-section ${visibleSections['cta-section'] ? 'visible' : ''}`}>
        <div className="cta-inner">
          <div className="cta-text">
            <span className="section-tag" style={{ marginBottom: '16px' }}>Para Profesionales</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px', lineHeight: 1.2 }}>¿Eres un profesional del hogar?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', marginBottom: '32px', maxWidth: '500px' }}>
              Únete a nuestra red de técnicos de confianza. Recibe solicitudes, gestiona tu calendario y cobra de forma segura.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
              {[
                { icon: <UserPlus size={20} />, text: 'Perfil profesional personalizado' },
                { icon: <CalendarCheck size={20} />, text: 'Gestión de agenda y citas en tiempo real' },
                { icon: <Zap size={20} />, text: 'Pagos seguros con PayPal integrado' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                  <div style={{ color: 'var(--primary)' }}>{item.icon}</div>
                  {item.text}
                </div>
              ))}
            </div>
            <Link to="/technicians/register" className="btn btn-primary btn-lg">Crear Cuenta de Técnico</Link>
          </div>
          <div className="cta-visual">
            <div className="cta-3d-card">
              <Wrench size={80} strokeWidth={1.2} />
              <div className="cta-3d-ring"></div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Home style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>Vecinos<span className="text-gradient">Connect</span></span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>© 2026 VecinosConnect. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

import { Login, Register } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
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
