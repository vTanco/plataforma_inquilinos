import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, LogIn, Mail, Lock, User, Briefcase, Phone, FileText, MapPin } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      if (res.status === 202 && data.requireSetup) {
        setError('Cuenta no encontrada. Ve a "Registrarse" para crearla.');
      } else if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión con Google');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <LogIn className="text-primary" /> Iniciar Sesión
        </h2>
        {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} size={20} />
              <input type="email" name="email" className="input-field" style={{ paddingLeft: '40px' }} value={formData.email} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} size={20} />
              <input type="password" name="password" className="input-field" style={{ paddingLeft: '40px' }} value={formData.password} onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>Entrar con Email</button>
        </form>
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '100%', height: '1px', background: 'var(--border)', position: 'relative' }}>
            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', padding: '0 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>O</span>
          </div>
          <GoogleLogin 
            onSuccess={handleGoogleLogin} 
            onError={() => setError('Fallo al conectar con Google')} 
            theme="filled_black" 
            text="signin_with" 
            shape="pill"
          />
        </div>
      </div>
    </div>
  );
};

export const Register = ({ role = 'tenant' }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', role: role, 
    service_category: '', phone: '', description: '' 
  });
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [isVerifyingAddress, setIsVerifyingAddress] = useState(false);

  const verifyAddress = async () => {
    if (!address) return;
    setIsVerifyingAddress(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setFormData({ ...formData, latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) });
      } else {
        alert('No pudimos encontrar esa dirección. Por favor, sé más específico (Ej: "Calle Gran Vía 1, Madrid").');
      }
    } catch (err) {
      alert('Error al verificar la dirección.');
    } finally {
      setIsVerifyingAddress(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrarse');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleRegister = async (credentialResponse) => {
    if (!formData.latitude) {
      setError('Por favor, obtén tu ubicación actual antes de registrarte.');
      return;
    }
    if (role === 'technician' && (!formData.service_category || !formData.phone || !formData.description)) {
      setError('Por favor, completa los datos de tu categoría de servicio antes de usar Google.');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, credential: credentialResponse.credential })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrarse con Google');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const isTechnician = role === 'technician';

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <UserPlus className="text-primary" /> 
          {isTechnician ? 'Registro de Técnico' : 'Registro de Inquilino'}
        </h2>
        {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Nombre Completo</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} size={20} />
              <input type="text" name="name" className="input-field" style={{ paddingLeft: '40px' }} value={formData.name} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} size={20} />
              <input type="email" name="email" className="input-field" style={{ paddingLeft: '40px' }} value={formData.email} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} size={20} />
              <input type="password" name="password" className="input-field" style={{ paddingLeft: '40px' }} value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          {isTechnician && (
            <>
              <div className="form-group">
                <label className="input-label">Categoría de Servicio</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} size={20} />
                  <select name="service_category" className="input-field" style={{ paddingLeft: '40px', appearance: 'none' }} value={formData.service_category} onChange={handleChange} required>
                    <option value="">Selecciona un servicio</option>
                    <option value="Fontanería">Fontanería</option>
                    <option value="Carpintería">Carpintería</option>
                    <option value="Electricidad">Electricidad</option>
                    <option value="Pintura">Pintura</option>
                    <option value="Jardinería">Jardinería</option>
                    <option value="Humedades">Humedades</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="input-label">Teléfono</label>
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} size={20} />
                  <input type="tel" name="phone" className="input-field" style={{ paddingLeft: '40px' }} value={formData.phone} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="input-label">Descripción o Experiencia</label>
                <div style={{ position: 'relative' }}>
                  <FileText style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} size={20} />
                  <textarea name="description" className="input-field" style={{ paddingLeft: '40px', minHeight: '100px' }} value={formData.description} onChange={handleChange} required />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="input-label">Ubicación (Requerida para buscar servicios a menos de 30km)</label>
            {formData.latitude && formData.longitude ? (
               <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <MapPin size={20} /> {isTechnician ? 'Dirección validada correctamente' : 'Ubicación registrada correctamente'}
               </div>
            ) : isTechnician ? (
              <div>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ej: Calle Alcalá 12, Madrid"
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  style={{ marginBottom: '8px', paddingLeft: '12px' }}
                />
                <button type="button" onClick={verifyAddress} className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--primary)', color: 'var(--primary)' }} disabled={isVerifyingAddress || !address}>
                  <MapPin size={20} /> {isVerifyingAddress ? 'Verificando...' : 'Verificar Dirección'}
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => setFormData({ ...formData, latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                    (err) => alert('Error al obtener la ubicación. Por favor, permite el acceso en tu navegador.')
                  );
                } else {
                  alert('Tu navegador no soporta geolocalización.');
                }
              }} className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                <MapPin size={20} /> Obtener mi ubicación actual
              </button>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={!formData.latitude}>
            {isTechnician ? 'Registrarme con Email' : 'Crear Cuenta con Email'}
          </button>
        </form>
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '100%', height: '1px', background: 'var(--border)', position: 'relative' }}>
            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', padding: '0 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>O</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Asegúrate de obtener tu ubicación (y completar los datos arriba) antes de pinchar en el botón de Google.
          </p>
          <GoogleLogin 
            onSuccess={handleGoogleRegister} 
            onError={() => setError('Fallo al conectar con Google')} 
            theme="filled_black" 
            text="signup_with" 
            shape="pill"
          />
        </div>
      </div>
    </div>
  );
};
