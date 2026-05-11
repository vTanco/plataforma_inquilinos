import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Clock, Star, PenTool, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';

const TechnicianDashboard = ({ user }) => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetch('/api/appointments', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="page-container animate-fade-in">
      <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Panel de Técnico: {user.name}</h2>
      
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar className="text-primary" /> Mi Agenda de Trabajos
        </h3>
        
        {appointments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Aún no tienes citas programadas.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {appointments.map(app => (
              <div key={app.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{app.service_category} - Cliente: {app.other_party_name}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={16} /> {new Date(app.appointment_date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500, background: app.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: app.status === 'pending' ? '#eab308' : '#22c55e' }}>
                    {app.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const HireServiceFlow = ({ user, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service_category: '',
    technician_id: null,
    appointment_date: '',
    signature: ''
  });
  const [technicians, setTechnicians] = useState([]);
  const sigCanvas = useRef({});

  const services = ['Fontanería', 'Carpintería', 'Electricidad', 'Pintura', 'Jardinería', 'Humedades'];

  useEffect(() => {
    if (step === 2 && formData.service_category) {
      fetch(`/api/technicians?category=${formData.service_category}`)
        .then(res => res.json())
        .then(data => setTechnicians(data))
        .catch(console.error);
    }
  }, [step, formData.service_category]);

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Recibo de Contratación - VecinosConnect', 20, 20);
    
    doc.setFontSize(14);
    doc.text(`Inquilino: ${user.name}`, 20, 40);
    doc.text(`Servicio Contratado: ${formData.service_category}`, 20, 50);
    doc.text(`Fecha y Hora: ${new Date(formData.appointment_date).toLocaleString()}`, 20, 60);
    
    doc.text('Firma del Inquilino:', 20, 80);
    if (formData.signature) {
      doc.addImage(formData.signature, 'PNG', 20, 90, 80, 40);
    }
    
    doc.save(`Recibo_${formData.service_category}.pdf`);
  };

  const handleSubmit = async () => {
    const signatureUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    const finalData = { ...formData, signature: signatureUrl };
    
    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(finalData)
      });
      setFormData(finalData);
      generatePDF();
      onComplete();
    } catch (err) {
      console.error(err);
      alert('Error al procesar la contratación.');
    }
  };

  return (
    <div className="glass-panel animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.5rem' }}>Nueva Contratación</h3>
        <button onClick={onCancel} className="btn btn-outline" style={{ padding: '4px 12px' }}>Cancelar</button>
      </div>

      <div style={{ display: 'flex', marginBottom: '32px', gap: '8px' }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: s <= step ? 'var(--primary)' : 'var(--border)' }} />
        ))}
      </div>

      {step === 1 && (
        <div className="animate-fade-in">
          <h4 style={{ marginBottom: '16px' }}>1. Selecciona el tipo de servicio</h4>
          <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', marginTop: 0 }}>
            {services.map(srv => (
              <div 
                key={srv} 
                onClick={() => { setFormData({ ...formData, service_category: srv }); handleNext(); }}
                style={{ padding: '20px', border: `2px solid ${formData.service_category === srv ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', background: formData.service_category === srv ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}
              >
                <h5 style={{ fontSize: '1.1rem' }}>{srv}</h5>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <h4 style={{ marginBottom: '16px' }}>2. Elige un técnico profesional</h4>
          {technicians.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No hay técnicos disponibles para este servicio ahora mismo.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {technicians.map(tech => (
                <div key={tech.id} onClick={() => setFormData({ ...formData, technician_id: tech.id })} style={{ padding: '20px', border: `2px solid ${formData.technician_id === tech.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h5 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{tech.name}</h5>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{tech.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                    <Star fill="currentColor" size={18} /> {tech.rating} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({tech.reviews_count})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <button onClick={handlePrev} className="btn btn-outline">Atrás</button>
            <button onClick={handleNext} disabled={!formData.technician_id} className="btn btn-primary">Continuar</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in">
          <h4 style={{ marginBottom: '16px' }}>3. Selecciona fecha y hora</h4>
          <div className="form-group">
            <label className="input-label">Fecha y Hora de la cita</label>
            <input 
              type="datetime-local" 
              className="input-field" 
              value={formData.appointment_date}
              onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <button onClick={handlePrev} className="btn btn-outline">Atrás</button>
            <button onClick={handleNext} disabled={!formData.appointment_date} className="btn btn-primary">Continuar</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="animate-fade-in">
          <h4 style={{ marginBottom: '16px' }}>4. Firma de Confirmación</h4>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Por favor, firma abajo para confirmar la contratación. Al finalizar, se descargará tu recibo en PDF.</p>
          <div style={{ border: '1px solid var(--border)', borderRadius: '12px', background: '#fff', overflow: 'hidden' }}>
            <SignatureCanvas 
              ref={sigCanvas} 
              penColor="black" 
              canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }} 
            />
          </div>
          <button onClick={() => sigCanvas.current.clear()} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', marginTop: '8px', cursor: 'pointer' }}>
            Limpiar firma
          </button>

          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <button onClick={handlePrev} className="btn btn-outline">Atrás</button>
            <button onClick={handleSubmit} className="btn btn-primary"><CheckCircle size={18} /> Confirmar y Generar PDF</button>
          </div>
        </div>
      )}
    </div>
  );
};

const TenantDashboard = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [isHiring, setIsHiring] = useState(false);

  const fetchAppointments = () => {
    fetch('/api/appointments', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (isHiring) {
    return (
      <div className="page-container">
        <HireServiceFlow 
          user={user} 
          onComplete={() => { setIsHiring(false); fetchAppointments(); }} 
          onCancel={() => setIsHiring(false)} 
        />
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem' }}>Hola, {user.name}</h2>
        <button onClick={() => setIsHiring(true)} className="btn btn-primary"><PenTool size={18} /> Nueva Contratación</button>
      </div>
      
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText className="text-primary" /> Historial de Contrataciones
        </h3>
        
        {appointments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No tienes servicios contratados todavía.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {appointments.map(app => (
              <div key={app.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{app.service_category} - Técnico: {app.other_party_name}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={16} /> {new Date(app.appointment_date).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500, background: app.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: app.status === 'pending' ? '#eab308' : '#22c55e' }}>
                    {app.status.toUpperCase()}
                  </span>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: '#ef4444', color: '#ef4444' }}>
                    <AlertCircle size={16} /> Abrir Incidencia
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <>
      {user.role === 'tenant' ? <TenantDashboard user={user} /> : <TechnicianDashboard user={user} />}
    </>
  );
};
