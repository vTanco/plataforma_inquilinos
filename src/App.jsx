import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Wrench, Droplets, Zap, Paintbrush, TreePine, CloudRain, UserPlus, CalendarCheck, LogOut, Star, Shield, Clock, MapPin, ChevronRight } from 'lucide-react';

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

const ServicesPage = () => {
  const services = [
    { icon: <Droplets size={32} />, name: 'Fontanería', desc: 'Reparación de tuberías, grifos, cisternas y desatascos. Instalaciones de agua caliente y fría.', features: ['Reparación de fugas', 'Instalación de grifería', 'Desatascos profesionales', 'Revisión de calderas'] },
    { icon: <Wrench size={32} />, name: 'Carpintería', desc: 'Muebles a medida, puertas, ventanas y todo tipo de trabajo en madera de alta calidad.', features: ['Muebles a medida', 'Instalación de puertas', 'Reparación de tarimas', 'Montaje de cocinas'] },
    { icon: <Zap size={32} />, name: 'Electricidad', desc: 'Instalaciones eléctricas, cuadros, enchufes y revisiones de seguridad certificadas.', features: ['Instalación de puntos de luz', 'Revisión de cuadros', 'Certificados eléctricos', 'Domótica básica'] },
    { icon: <Paintbrush size={32} />, name: 'Pintura', desc: 'Pintura de interiores y exteriores con acabados profesionales y materiales de primera.', features: ['Pintura interior', 'Fachadas exteriores', 'Alisado de paredes', 'Pintura decorativa'] },
    { icon: <TreePine size={32} />, name: 'Jardinería', desc: 'Diseño, mantenimiento y cuidado integral de jardines, terrazas y espacios verdes.', features: ['Poda y desbroce', 'Sistemas de riego', 'Diseño de jardines', 'Mantenimiento mensual'] },
    { icon: <CloudRain size={32} />, name: 'Humedades', desc: 'Diagnóstico y tratamiento profesional de humedades, filtraciones e impermeabilizaciones.', features: ['Diagnóstico gratuito', 'Impermeabilización', 'Tratamiento de moho', 'Inyección de resinas'] },
  ];

  const [visible, setVisible] = React.useState({});

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setVisible(prev => ({ ...prev, [e.target.id]: true })); });
    }, { threshold: 0.1 });
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ overflow: 'hidden' }}>
      <section className="page-container" style={{ paddingTop: '80px', paddingBottom: '40px' }}>
        <div className={`section-header ${visible['srv-header'] ? 'visible' : ''}`} id="srv-header" data-reveal>
          <span className="section-tag">Servicios Profesionales</span>
          <h1 className="section-title">Todo lo que tu hogar <span className="text-gradient">necesita</span></h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '16px auto 0', fontSize: '1.1rem' }}>Profesionales verificados a un clic de distancia. Selecciona el servicio que necesitas y encuentra al técnico ideal.</p>
        </div>
      </section>

      <section className="page-container" style={{ paddingTop: '0', paddingBottom: '120px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {services.map((srv, i) => (
            <div key={i} id={`srvd-${i}`} data-reveal className={`service-card-new ${visible[`srvd-${i}`] ? 'visible' : ''}`} style={{ animationDelay: `${i * 0.08}s`, display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap', padding: '32px' }}>
              <div style={{ flex: '0 0 64px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {srv.icon}
                </div>
              </div>
              <div style={{ flex: '1 1 300px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>{srv.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '20px' }}>{srv.desc}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                  {srv.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <ChevronRight size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} /> {f}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: '0 0 auto', alignSelf: 'center' }}>
                <Link to="/register" className="btn btn-primary">Solicitar</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const TechniciansPage = () => {
  const [technicians, setTechnicians] = React.useState([]);
  const [filter, setFilter] = React.useState('Todos');
  const [visible, setVisible] = React.useState({});
  const categories = ['Todos', 'Fontanería', 'Carpintería', 'Electricidad', 'Pintura', 'Jardinería', 'Humedades'];

  React.useEffect(() => {
    fetch('/api/technicians/public')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTechnicians(data); })
      .catch(console.error);
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setVisible(prev => ({ ...prev, [e.target.id]: true })); });
    }, { threshold: 0.1 });
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [technicians, filter]);

  const filtered = filter === 'Todos' ? technicians : technicians.filter(t => t.service_category === filter);

  return (
    <div style={{ overflow: 'hidden' }}>
      <section className="page-container" style={{ paddingTop: '80px', paddingBottom: '40px' }}>
        <div className={`section-header ${visible['tech-header'] ? 'visible' : ''}`} id="tech-header" data-reveal>
          <span className="section-tag">Nuestro Equipo</span>
          <h1 className="section-title">Técnicos <span className="text-gradient">verificados</span></h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '16px auto 0', fontSize: '1.1rem' }}>Profesionales de confianza con perfiles verificados, valoraciones reales y tarifas transparentes.</p>
        </div>
      </section>

      <section className="page-container" style={{ paddingTop: '0', paddingBottom: '120px' }}>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '40px', justifyContent: 'center' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={filter === cat ? 'btn btn-primary' : 'btn btn-outline'} style={{ padding: '8px 20px', fontSize: '0.9rem', borderRadius: '50px' }}>
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem', padding: '60px 0' }}>No hay técnicos disponibles en esta categoría todavía.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {filtered.map((tech, i) => (
              <div key={tech.id} id={`tech-${i}`} data-reveal className={`service-card-new ${visible[`tech-${i}`] ? 'visible' : ''}`} style={{ animationDelay: `${i * 0.08}s`, padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '4px' }}>{tech.name}</h3>
                    <span style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: '20px', background: 'rgba(139,92,246,0.12)', color: '#a78bfa', fontWeight: 500 }}>{tech.service_category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <Shield size={14} style={{ color: '#22c55e' }} />
                    <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>Verificado</span>
                  </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px', minHeight: '50px' }}>{tech.description || 'Profesional con amplia experiencia en el sector.'}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= Math.floor(parseFloat(tech.rating) || 0) ? '#fbbf24' : 'transparent'} color="#fbbf24" />)}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{parseFloat(tech.rating || 0).toFixed(1)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({tech.reviews_count || 0})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Clock size={14} /> Respuesta rápida
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>{parseFloat(tech.hourly_rate || 30).toFixed(0)}€</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> / hora</span>
                  </div>
                  <Link to="/register" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Contratar</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/technicians" element={<TechniciansPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register role="tenant" />} />
        <Route path="/technicians/register" element={<Register role="technician" />} />
      </Routes>
    </Router>
  );
};

export default App;
