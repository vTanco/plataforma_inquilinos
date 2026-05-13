import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar as CalendarIcon, Clock, Star, PenTool, CheckCircle, AlertCircle, FileText, User } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

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
          <CalendarIcon className="text-primary" /> Mi Agenda de Trabajos
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
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500, background: app.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: app.status === 'pending' ? '#eab308' : '#22c55e', display: 'inline-block', marginBottom: '8px' }}>
                    {app.status.toUpperCase()}
                  </span>
                  {app.pdf_document && (
                    <div style={{ marginTop: '8px' }}>
                      <a href={app.pdf_document} download={`Recibo_${app.service_category}.pdf`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        <FileText size={14} /> Ver Recibo
                      </a>
                    </div>
                  )}
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
  const [selectedTechProfile, setSelectedTechProfile] = useState(null);
  
  // Calendar states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  
  const sigCanvas = useRef({});

  const services = ['Fontanería', 'Carpintería', 'Electricidad', 'Pintura', 'Jardinería', 'Humedades'];
  const availableTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  const [bookedAppointments, setBookedAppointments] = useState([]);

  useEffect(() => {
    if (step === 3 && formData.technician_id) {
      fetch(`/api/technicians/${formData.technician_id}/appointments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setBookedAppointments(data.map(app => new Date(app.appointment_date)));
          }
        })
        .catch(console.error);
    }
  }, [step, formData.technician_id]);

  const isTimeBooked = (time) => {
    if (!selectedDate) return false;
    const [hours, minutes] = time.split(':');
    const timeDate = new Date(selectedDate);
    timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const timeStr = timeDate.toISOString();
    return bookedAppointments.some(d => d.toISOString() === timeStr);
  };

  useEffect(() => {
    if (step === 2 && formData.service_category) {
      fetch(`/api/technicians?category=${formData.service_category}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => setTechnicians(data))
        .catch(console.error);
    }
  }, [step, formData.service_category]);

  // Update appointment date when date or time changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':');
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setFormData(prev => ({ ...prev, appointment_date: newDate.toISOString() }));
    }
  }, [selectedDate, selectedTime]);

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const selectTechnician = (techId) => {
    setFormData({ ...formData, technician_id: techId });
    setSelectedTechProfile(null);
    handleNext();
  };

  const generatePDF = (signatureUrl) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Recibo de Contratación - VecinosConnect', 20, 20);
    
    doc.setFontSize(14);
    doc.text(`Inquilino: ${user.name}`, 20, 40);
    doc.text(`Servicio Contratado: ${formData.service_category}`, 20, 50);
    doc.text(`Fecha y Hora: ${new Date(formData.appointment_date).toLocaleString()}`, 20, 60);
    
    doc.text('Firma del Inquilino:', 20, 80);
    if (signatureUrl) {
      doc.addImage(signatureUrl, 'PNG', 20, 90, 80, 40);
    }
    
    return doc;
  };

  const handleSubmit = async () => {
    if (sigCanvas.current.isEmpty()) {
      alert('Por favor, firma el documento antes de confirmar.');
      return;
    }

    try {
      const signatureUrl = sigCanvas.current.getCanvas().toDataURL('image/png');
      const doc = generatePDF(signatureUrl);
      const pdfBase64 = doc.output('datauristring');

      const finalData = { ...formData, signature: signatureUrl, pdf_document: pdfBase64 };
    
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(finalData)
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('Error detallado del servidor:', errData);
        throw new Error(`Error en el servidor: ${errData.details || errData.error || 'Desconocido'}`);
      }

      setFormData(finalData);
      doc.save(`Recibo_${formData.service_category}.pdf`);
      onComplete();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      alert(`Hubo un error: ${err.message}`);
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

      {step === 2 && !selectedTechProfile && (
        <div className="animate-fade-in">
          <h4 style={{ marginBottom: '16px' }}>2. Elige un técnico profesional (a menos de 30km)</h4>
          {technicians.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No hay técnicos disponibles en tu zona para este servicio.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {technicians.map(tech => (
                <div key={tech.id} style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h5 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{tech.name}</h5>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', marginBottom: '8px' }}>
                      <Star fill="currentColor" size={16} /> <span style={{ fontWeight: 600 }}>{tech.rating}</span> <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({tech.reviews_count} opiniones)</span>
                      {tech.distance && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '8px' }}>• A {parseFloat(tech.distance).toFixed(1)} km</span>}
                    </div>
                  </div>
                  <button onClick={() => setSelectedTechProfile(tech)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
                    <User size={16} /> Ver Perfil
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <button onClick={handlePrev} className="btn btn-outline">Atrás</button>
          </div>
        </div>
      )}

      {step === 2 && selectedTechProfile && (
        <div className="animate-fade-in glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Perfil Profesional: {selectedTechProfile.name}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', marginBottom: '16px' }}>
            <Star fill="currentColor" size={18} /> <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedTechProfile.rating}</span> 
            <span style={{ color: 'var(--text-muted)' }}>({selectedTechProfile.reviews_count} reseñas verificadas)</span>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <h5 style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sobre el profesional</h5>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>{selectedTechProfile.description}</p>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <button onClick={() => setSelectedTechProfile(null)} className="btn btn-outline">Atrás</button>
            <button onClick={() => selectTechnician(selectedTechProfile.id)} className="btn btn-primary">
              <CheckCircle size={18} /> Elegir este profesional
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in">
          <h4 style={{ marginBottom: '16px' }}>3. Selecciona fecha y hora</h4>
          
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <label className="input-label" style={{ marginBottom: '12px' }}>Elige un día</label>
              <ReactCalendar 
                onChange={setSelectedDate} 
                value={selectedDate}
                minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                locale="es-ES"
              />
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <label className="input-label" style={{ marginBottom: '12px' }}>Horas disponibles</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
                {availableTimes.map(time => {
                  const booked = isTimeBooked(time);
                  return (
                    <button 
                      key={time}
                      disabled={booked}
                      onClick={() => setSelectedTime(time)}
                      style={{ 
                        padding: '12px', 
                        borderRadius: '8px', 
                        background: booked ? 'rgba(255,255,255,0.02)' : (selectedTime === time ? 'var(--primary)' : 'rgba(255,255,255,0.05)'),
                        border: `1px solid ${selectedTime === time ? 'var(--primary)' : 'var(--border)'}`,
                        color: booked ? 'var(--text-muted)' : 'white',
                        cursor: booked ? 'not-allowed' : 'pointer',
                        fontWeight: selectedTime === time ? 600 : 400,
                        transition: 'all 0.2s',
                        opacity: booked ? 0.5 : 1
                      }}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <button onClick={handlePrev} className="btn btn-outline">Atrás</button>
            <button onClick={handleNext} disabled={!selectedDate || !selectedTime} className="btn btn-primary">Continuar</button>
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

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const hasApp = appointments.find(app => {
        const appDate = new Date(app.appointment_date);
        return appDate.getDate() === date.getDate() &&
               appDate.getMonth() === date.getMonth() &&
               appDate.getFullYear() === date.getFullYear();
      });
      return hasApp ? 'has-appointment' : null;
    }
    return null;
  };

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem' }}>Hola, {user.name}</h2>
        <button onClick={() => setIsHiring(true)} className="btn btn-primary"><PenTool size={18} /> Nueva Contratación</button>
      </div>
      
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div className="glass-panel" style={{ flex: '1 1 350px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon className="text-primary" /> Mi Calendario
          </h3>
          <ReactCalendar 
            tileClassName={getTileClassName}
            locale="es-ES"
          />
          <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', background: 'rgba(139, 92, 246, 0.4)', border: '1px solid var(--accent)', borderRadius: '4px' }}></div>
            <span>Día con servicio programado</span>
          </div>
        </div>

        <div className="glass-panel" style={{ flex: '2 1 500px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500, background: app.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: app.status === 'pending' ? '#eab308' : '#22c55e' }}>
                    {app.status.toUpperCase()}
                  </span>
                  {app.pdf_document && (
                    <a href={app.pdf_document} download={`Recibo_${app.service_category}.pdf`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                      <FileText size={16} /> Ver Recibo
                    </a>
                  )}
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
