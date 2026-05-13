import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar as CalendarIcon, Clock, Star, PenTool, CheckCircle, AlertCircle, FileText, User, Trash2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { PayPalButtons } from '@paypal/react-paypal-js';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';

const generateProfessionalPDF = (data) => {
  const { tenantName, tenantEmail, techName, techEmail, serviceCategory, appointmentDate, description, signatureUrl, estimatedHours, hourlyRate } = data;
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = pageW - margin * 2;
  const refNum = `VC-${Date.now().toString().slice(-8)}`;
  const now = new Date();
  let y = 20;

  // --- HEADER BAR ---
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 40, 'F');
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 38, pageW, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('VecinosConnect', margin, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Plataforma de Servicios del Hogar', margin, 26);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIBO DE CONTRATACI\u00d3N', pageW - margin, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Ref: ${refNum}`, pageW - margin, 26, { align: 'right' });
  doc.text(`Fecha: ${now.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageW - margin, 32, { align: 'right' });

  y = 52;
  doc.setTextColor(30, 30, 30);

  // --- CLIENT & TECHNICIAN INFO BOXES ---
  const boxW = (contentW - 10) / 2;

  // Client box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, boxW, 45, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, boxW, 45, 3, 3, 'S');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL CLIENTE', margin + 8, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(tenantName || 'N/A', margin + 8, y + 20);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(tenantEmail || '', margin + 8, y + 27);
  doc.text('Rol: Inquilino', margin + 8, y + 34);

  // Technician box
  const techX = margin + boxW + 10;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(techX, y, boxW, 45, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(techX, y, boxW, 45, 3, 3, 'S');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL T\u00c9CNICO', techX + 8, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(techName || 'N/A', techX + 8, y + 20);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Especialidad: ${serviceCategory}`, techX + 8, y + 27);
  doc.text(`Tarifa: ${hourlyRate || 30}\u20ac/hora`, techX + 8, y + 34);

  y += 58;

  // --- SERVICE TABLE ---
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICIO', margin + 8, y + 7);
  doc.text('FECHA', margin + 80, y + 7);
  doc.text('HORA', margin + 120, y + 7);
  doc.text('ESTADO', pageW - margin - 8, y + 7, { align: 'right' });
  y += 12;

  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentW, 12, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentW, 12, 'S');
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const appDate = new Date(appointmentDate);
  doc.text(serviceCategory, margin + 8, y + 8);
  doc.text(appDate.toLocaleDateString('es-ES'), margin + 80, y + 8);
  doc.text(appDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), margin + 120, y + 8);
  doc.setTextColor(34, 197, 94);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIRMADO', pageW - margin - 8, y + 8, { align: 'right' });

  y += 22;

  // --- DESCRIPTION ---
  if (description) {
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPCI\u00d3N DEL SERVICIO', margin, y);
    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 251, 235);
    const descLines = doc.splitTextToSize(description, contentW - 16);
    const descH = descLines.length * 5 + 10;
    doc.roundedRect(margin, y, contentW, descH, 2, 2, 'FD');
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text(descLines, margin + 8, y + 8);
    y += descH + 10;
  } else {
    y += 5;
  }

  // --- PRICING SUMMARY ---
  const rate = parseFloat(hourlyRate) || 30;
  const hours = parseInt(estimatedHours) || 1;
  const subtotal = rate * hours;
  const iva = subtotal * 0.21;
  const total = subtotal + iva;

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESUPUESTO FINAL', margin, y);
  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentW, 42, 2, 2, 'S');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Concepto: ${serviceCategory} (${hours}h x ${rate.toFixed(2)}\u20ac)`, margin + 8, y + 9);
  doc.text(`${subtotal.toFixed(2)} \u20ac`, pageW - margin - 8, y + 9, { align: 'right' });
  doc.setDrawColor(240, 240, 240);
  doc.line(margin + 8, y + 13, pageW - margin - 8, y + 13);
  doc.text('IVA (21%):', margin + 8, y + 20);
  doc.text(`${iva.toFixed(2)} \u20ac`, pageW - margin - 8, y + 20, { align: 'right' });
  doc.line(margin + 8, y + 24, pageW - margin - 8, y + 24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('TOTAL A PAGAR:', margin + 8, y + 33);
  doc.setFontSize(12);
  doc.text(`${total.toFixed(2)} \u20ac`, pageW - margin - 8, y + 33, { align: 'right' });

  y += 54;

  // --- SIGNATURE ---
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('FIRMA DEL INQUILINO', margin, y);
  y += 4;
  if (signatureUrl) {
    try {
      doc.addImage(signatureUrl, 'PNG', margin, y, 70, 35);
    } catch(e) { console.error("Error adding signature to PDF", e); }
  }
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(margin, y + 36, margin + 70, y + 36);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(tenantName || '', margin, y + 42);

  // --- FOOTER ---
  const footerY = 275;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 5, pageW - margin, footerY - 5);
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.setFont('helvetica', 'normal');
  doc.text('Este documento es un recibo digital generado autom\u00e1ticamente por VecinosConnect.', margin, footerY);
  doc.text('El presupuesto ha sido validado por el t\u00e9cnico tras la aceptaci\u00f3n del servicio.', margin, footerY + 5);
  doc.text(`Ref: ${refNum} | ${now.toLocaleString('es-ES')} | vecinosconnect.com`, pageW - margin, footerY + 5, { align: 'right' });

  return doc;
};
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const TechnicianDashboard = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [acceptModal, setAcceptModal] = useState(null);
  const [acceptHours, setAcceptHours] = useState(1);
  const [needHelpers, setNeedHelpers] = useState(false);
  const [availableTechs, setAvailableTechs] = useState([]);
  const [selectedHelpers, setSelectedHelpers] = useState([]);

  useEffect(() => {
    fetch('/api/appointments', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error(err));
  }, []);

  const openAcceptModal = (app) => {
    setAcceptModal(app);
    setAcceptHours(1);
    setNeedHelpers(false);
    setSelectedHelpers([]);
    fetch('/api/technicians/public')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableTechs(data.filter(t => t.id !== user.id));
      })
      .catch(console.error);
  };

  const confirmAccept = async () => {
    if (!acceptModal) return;
    try {
      // 1. Fetch technician profile to get the hourly rate
      const profileRes = await fetch('/api/technician-profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const profileData = await profileRes.json();
      const hourlyRate = profileData.hourly_rate || 30;

      // 2. Generate PDF
      const pdfDoc = generateProfessionalPDF({
        tenantName: acceptModal.other_party_name,
        tenantEmail: acceptModal.other_party_email,
        techName: user.name,
        techEmail: user.email,
        serviceCategory: acceptModal.service_category,
        appointmentDate: acceptModal.appointment_date,
        description: acceptModal.description,
        signatureUrl: acceptModal.signature,
        estimatedHours: acceptHours,
        hourlyRate: hourlyRate
      });
      const pdfBase64 = pdfDoc.output('datauristring');

      // 3. Update status and save PDF
      const res = await fetch(`/api/appointments/${acceptModal.id}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'accepted', 
          estimated_hours: acceptHours, 
          helpers: selectedHelpers,
          pdf_document: pdfBase64 
        })
      });
      if (!res.ok) throw new Error('Error al actualizar');
      
      const updatedApp = await res.json();
      setAppointments(appointments.map(app => app.id === acceptModal.id ? updatedApp : app));
      setAcceptModal(null);
    } catch (err) {
      alert('Hubo un error al aceptar la cita y generar el recibo');
      console.error(err);
    }
  };

  const toggleHelper = (techId) => {
    setSelectedHelpers(prev => prev.includes(techId) ? prev.filter(id => id !== techId) : [...prev, techId]);
  };

  const updateStatus = async (id, newStatus) => {
    if (newStatus === 'accepted') return;
    let msg = newStatus === 'rejected' ? '¿Rechazar esta cita?' : '¿Anular esta cita?';
    if (window.confirm(msg)) {
      try {
        const res = await fetch(`/api/appointments/${id}/status`, {
          method: 'PATCH',
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) throw new Error('Error al actualizar');
        setAppointments(appointments.map(app => app.id === id ? { ...app, status: newStatus } : app));
      } catch (err) {
        alert('Hubo un error al actualizar la cita');
        console.error(err);
      }
    }
  };

  const deleteAppointment = async (id) => {
    if (window.confirm('¿Eliminar esta cita permanentemente de tu agenda?')) {
      try {
        const res = await fetch(`/api/appointments/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Error al eliminar');
        setAppointments(appointments.filter(app => app.id !== id));
      } catch (err) {
        alert('Hubo un error al eliminar la cita');
        console.error(err);
      }
    }
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const hasApp = appointments.find(app => {
        const appDate = new Date(app.appointment_date);
        return appDate.getDate() === date.getDate() &&
               appDate.getMonth() === date.getMonth() &&
               appDate.getFullYear() === date.getFullYear() &&
               app.status !== 'rejected' && app.status !== 'cancelled';
      });
      return hasApp ? 'has-appointment' : null;
    }
    return null;
  };

  const syncGoogleCalendar = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    onSuccess: async (tokenResponse) => {
      try {
        const timeMin = new Date().toISOString();
        const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`, {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const data = await res.json();
        
        if (!data.items) throw new Error('No items in response');

        const events = data.items.map(item => item.start.dateTime || item.start.date).filter(Boolean);
        
        const syncRes = await fetch('/api/appointments/sync', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ events })
        });
        
        if (!syncRes.ok) throw new Error('Error saving sync data');

        alert(`¡Sincronización completada! Se han bloqueado ${events.length} horarios de tu Google Calendar en la plataforma.`);
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('Error al sincronizar con Google Calendar');
      }
    },
    onError: () => alert('Fallo al conectar con Google Calendar')
  });

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '2rem' }}>Panel de Técnico: {user.name}</h2>
        <button onClick={() => syncGoogleCalendar()} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: '#4285F4', color: '#4285F4', background: 'rgba(66, 133, 244, 0.05)' }}>
          <CalendarIcon size={18} /> Sincronizar Google Calendar
        </button>
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
            <span>Día con cita programada</span>
          </div>
        </div>

        <div className="glass-panel" style={{ flex: '2 1 500px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText className="text-primary" /> Mi Agenda de Trabajos
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
                    {app.description && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px', padding: '8px 12px', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                        <strong style={{ color: 'var(--text)' }}>Comentario del cliente:</strong> {app.description}
                      </p>
                    )}
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500, background: app.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : (app.status === 'cancelled' || app.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'), color: app.status === 'pending' ? '#eab308' : (app.status === 'cancelled' || app.status === 'rejected' ? '#ef4444' : '#22c55e'), display: 'inline-block', marginBottom: '8px' }}>
                      {app.status === 'cancelled' ? 'ANULADA' : (app.status === 'rejected' ? 'RECHAZADA' : (app.status === 'accepted' ? 'ACEPTADA' : app.status.toUpperCase()))}
                    </span>
                    {app.pdf_document && app.status !== 'cancelled' && (
                      <div style={{ marginTop: '8px' }}>
                        <a href={app.pdf_document} download={`Recibo_${app.service_category}.pdf`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          <FileText size={14} /> Ver Recibo
                        </a>
                      </div>
                    )}
                    {app.status === 'pending' && (
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        <button onClick={() => openAcceptModal(app)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: '#22c55e', color: '#22c55e' }}>
                          Aceptar
                        </button>
                        <button onClick={() => updateStatus(app.id, 'rejected')} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }}>
                          Rechazar
                        </button>
                      </div>
                    )}
                    <button onClick={() => deleteAppointment(app.id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444', marginTop: '8px' }}>
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Accept Modal */}
      {acceptModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setAcceptModal(null)}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '560px', width: '90%', margin: 0, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>✅ Aceptar Trabajo</h3>

            <div style={{ marginBottom: '20px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.95rem', marginBottom: '4px' }}><strong>{acceptModal.service_category}</strong> — {acceptModal.other_party_name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(acceptModal.appointment_date).toLocaleString()}</p>
              {acceptModal.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px', fontStyle: 'italic' }}>"{acceptModal.description}"</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="input-label">Horas estimadas de trabajo</label>
              <input type="number" min="1" max="24" value={acceptHours} onChange={e => setAcceptHours(parseInt(e.target.value) || 1)} className="input-field" style={{ maxWidth: '120px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>Se bloquearán {acceptHours} hora(s) en tu calendario.</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${needHelpers ? 'var(--primary)' : 'var(--border)'}`, background: needHelpers ? 'rgba(59,130,246,0.08)' : 'transparent', transition: 'all 0.2s' }}>
                <input type="checkbox" checked={needHelpers} onChange={e => { setNeedHelpers(e.target.checked); if (!e.target.checked) setSelectedHelpers([]); }} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Necesito personal extra</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>Selecciona técnicos de la plataforma para que te ayuden</p>
                </div>
              </label>
            </div>

            {needHelpers && (
              <div style={{ marginBottom: '20px' }}>
                <label className="input-label">Selecciona ayudantes ({selectedHelpers.length} seleccionados)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                  {availableTechs.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No hay otros técnicos disponibles.</p>
                  ) : availableTechs.map(tech => (
                    <div key={tech.id} onClick={() => toggleHelper(tech.id)} style={{ padding: '12px 16px', borderRadius: '12px', border: `1px solid ${selectedHelpers.includes(tech.id) ? 'var(--primary)' : 'var(--border)'}`, background: selectedHelpers.includes(tech.id) ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tech.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>{tech.service_category}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>⭐ {parseFloat(tech.rating || 0).toFixed(1)}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{tech.hourly_rate || 30}€/h</span>
                        </div>
                      </div>
                      <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: `2px solid ${selectedHelpers.includes(tech.id) ? 'var(--primary)' : 'var(--border)'}`, background: selectedHelpers.includes(tech.id) ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
                        {selectedHelpers.includes(tech.id) && <CheckCircle size={14} color="white" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setAcceptModal(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={confirmAccept} className="btn btn-primary" style={{ flex: 1 }}>Aceptar Trabajo</button>
            </div>
          </div>
        </div>
      )}

      {/* Amazon Product Catalog */}
      <div className="glass-panel" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🛒 Catálogo de Productos Profesionales
          </h3>
          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(255, 153, 0, 0.15)', color: '#FF9900', border: '1px solid rgba(255, 153, 0, 0.3)' }}>
            Powered by Amazon
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Herramientas y materiales recomendados para profesionales. Al comprar a través de estos enlaces, apoyas la plataforma VecinosConnect.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { name: 'Taladro Percutor Bosch Professional', price: '89,99', oldPrice: '119,99', rating: 4.7, reviews: 3847, category: 'Electricidad', badge: 'Más vendido', link: 'https://amzn.to/vc-bosch-taladro' },
            { name: 'Llave Inglesa Ajustable Stanley 250mm', price: '14,95', oldPrice: '19,99', rating: 4.5, reviews: 2156, category: 'Fontanería', badge: null, link: 'https://amzn.to/vc-stanley-llave' },
            { name: 'Kit Soldadura Estaño 60W Profesional', price: '24,99', oldPrice: '34,99', rating: 4.3, reviews: 1423, category: 'Electricidad', badge: null, link: 'https://amzn.to/vc-soldadura-kit' },
            { name: 'Pistola de Silicona Wolfcraft MG 310', price: '12,49', oldPrice: '16,99', rating: 4.6, reviews: 5231, category: 'Humedades', badge: 'Amazon Choice', link: 'https://amzn.to/vc-wolfcraft-silicona' },
            { name: 'Set de Brochas Pintor Harris 5 uds', price: '18,90', oldPrice: '24,50', rating: 4.4, reviews: 987, category: 'Pintura', badge: null, link: 'https://amzn.to/vc-harris-brochas' },
            { name: 'Sierra Circular Makita 190mm 1200W', price: '129,00', oldPrice: '159,00', rating: 4.8, reviews: 4102, category: 'Carpintería', badge: 'Más vendido', link: 'https://amzn.to/vc-makita-sierra' },
            { name: 'Medidor Láser Bosch 50m GLM 50-27', price: '94,99', oldPrice: '129,99', rating: 4.7, reviews: 2890, category: 'General', badge: 'Amazon Choice', link: 'https://amzn.to/vc-bosch-medidor' },
            { name: 'Guantes Trabajo Ansell HyFlex Talla L', price: '8,99', oldPrice: '12,99', rating: 4.5, reviews: 6540, category: 'General', badge: null, link: 'https://amzn.to/vc-ansell-guantes' },
          ].map((product, i) => (
            <a key={i} href={product.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(255, 153, 0, 0.4)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 153, 0, 0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {product.badge && (
                  <span style={{ position: 'absolute', top: '12px', right: '12px', padding: '3px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, background: product.badge === 'Más vendido' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 153, 0, 0.15)', color: product.badge === 'Más vendido' ? '#ef4444' : '#FF9900', border: `1px solid ${product.badge === 'Más vendido' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 153, 0, 0.3)'}` }}>
                    {product.badge}
                  </span>
                )}
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{product.category}</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', lineHeight: 1.4, flexGrow: 1 }}>{product.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '1px' }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12} fill={s <= Math.floor(product.rating) ? '#fbbf24' : 'transparent'} color="#fbbf24" />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({product.reviews.toLocaleString()})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FF9900' }}>{product.price}€</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{product.oldPrice}€</span>
                </div>
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#00A8E1', padding: '2px 6px', background: 'rgba(0, 168, 225, 0.1)', borderRadius: '4px' }}>Prime</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Envío gratis</span>
                </div>
              </div>
            </a>
          ))}
        </div>
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
    signature: '',
    description: ''
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
            setBookedAppointments(data.map(app => ({
              date: new Date(app.appointment_date),
              hours: app.estimated_hours || 1
            })));
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
    const targetHour = timeDate.getHours();
    
    return bookedAppointments.some(app => {
      const isSameDay = app.date.getDate() === timeDate.getDate() &&
                        app.date.getMonth() === timeDate.getMonth() &&
                        app.date.getFullYear() === timeDate.getFullYear();
      if (!isSameDay) return false;

      const startHour = app.date.getHours();
      const endHour = startHour + app.hours;

      return targetHour >= startHour && targetHour < endHour;
    });
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



  const handleSubmit = async () => {
    if (sigCanvas.current.isEmpty()) {
      alert('Por favor, firma el documento antes de confirmar.');
      return;
    }

    try {
      const signatureUrl = sigCanvas.current.getCanvas().toDataURL('image/png');
      const finalData = { ...formData, signature: signatureUrl };
    
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
        {[1, 2, 3, 4, 5].map(s => (
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
                    <div style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '4px' }}>Tarifa: {tech.hourly_rate || '30.00'}€ / hora</div>
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
          <div style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '8px' }}>Tarifa: {selectedTechProfile.hourly_rate || '30.00'}€ / hora</div>
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
          <h4 style={{ marginBottom: '16px' }}>4. Describe el servicio que necesitas</h4>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Proporciona detalles sobre el problema o trabajo a realizar. Esto ayudará al técnico a estimar el tiempo necesario.</p>
          <textarea 
            className="input-field" 
            style={{ minHeight: '150px', paddingLeft: '16px', paddingTop: '12px', resize: 'vertical' }} 
            placeholder="Ej: Tengo una fuga en la tubería del baño principal. El grifo gotea constantemente desde hace una semana..." 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
          />
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <button onClick={handlePrev} className="btn btn-outline">Atrás</button>
            <button onClick={handleNext} disabled={!formData.description.trim()} className="btn btn-primary">Continuar</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="animate-fade-in">
          <h4 style={{ marginBottom: '16px' }}>5. Firma de Confirmación</h4>
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
  const [paymentModal, setPaymentModal] = useState(null);

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

  const handleCancel = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas anular esta cita?')) {
      try {
        const res = await fetch(`/api/appointments/${id}/status`, {
          method: 'PATCH',
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'cancelled' })
        });
        if (!res.ok) throw new Error('Error al anular');
        setAppointments(appointments.map(app => app.id === id ? { ...app, status: 'cancelled' } : app));
      } catch (err) {
        alert('Hubo un error al anular la cita');
        console.error(err);
      }
    }
  };

  const deleteAppointment = async (id) => {
    if (window.confirm('¿Eliminar esta contratación permanentemente?')) {
      try {
        const res = await fetch(`/api/appointments/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Error al eliminar');
        setAppointments(appointments.filter(app => app.id !== id));
      } catch (err) {
        alert('Hubo un error al eliminar la cita');
        console.error(err);
      }
    }
  };

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
                  <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500, background: app.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : (app.status === 'cancelled' || app.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'), color: app.status === 'pending' ? '#eab308' : (app.status === 'cancelled' || app.status === 'rejected' ? '#ef4444' : '#22c55e') }}>
                    {app.status === 'cancelled' ? 'ANULADA' : (app.status === 'rejected' ? 'RECHAZADA' : (app.status === 'accepted' ? 'ACEPTADA' : app.status.toUpperCase()))}
                  </span>
                  {app.pdf_document && app.status !== 'cancelled' && (
                    <a href={app.pdf_document} download={`Recibo_${app.service_category}.pdf`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                      <FileText size={16} /> Ver Recibo
                    </a>
                  )}
                  {app.status === 'pending' && (
                    <button onClick={() => handleCancel(app.id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: '#ef4444', color: '#ef4444' }}>
                      Anular
                    </button>
                  )}
                  {app.status === 'accepted' && (
                    <button onClick={() => setPaymentModal(app)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: '#0070ba', borderColor: '#0070ba', color: 'white' }}>
                      Pagar con PayPal
                    </button>
                  )}
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: '#ef4444', color: '#ef4444' }}>
                    <AlertCircle size={16} /> Abrir Incidencia
                  </button>
                  <button onClick={() => deleteAppointment(app.id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: '#6b7280', color: '#6b7280' }}>
                    <Trash2 size={16} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {paymentModal && (() => {
        const rate = parseFloat(paymentModal.hourly_rate) || 30;
        const hours = paymentModal.estimated_hours || 1;
        const subtotal = rate * hours;
        const iva = subtotal * 0.21;
        const total = subtotal + iva;

        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setPaymentModal(null)}>
            <div className="glass-panel animate-fade-in" style={{ maxWidth: '480px', width: '90%', margin: '0' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText className="text-primary" /> Desglose de Donación
              </h3>

              <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p style={{ marginBottom: '8px', fontSize: '0.95rem' }}><strong>Servicio:</strong> {paymentModal.service_category}</p>
                <p style={{ marginBottom: '8px', fontSize: '0.95rem' }}><strong>Técnico:</strong> {paymentModal.other_party_name}</p>
                <p style={{ fontSize: '0.95rem' }}><strong>Fecha:</strong> {new Date(paymentModal.appointment_date).toLocaleString()}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tarifa por hora</span>
                  <span>{rate.toFixed(2)} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Horas estimadas</span>
                  <span>× {hours}</span>
                </div>
                <div style={{ height: '1px', background: 'var(--border)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>IVA (21%)</span>
                  <span>{iva.toFixed(2)} €</span>
                </div>
                <div style={{ height: '1px', background: 'var(--border)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700 }}>
                  <span>Total (Donación)</span>
                  <span style={{ color: 'var(--primary)' }}>{total.toFixed(2)} €</span>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <PayPalButtons
                  style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 45 }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: 'CAPTURE',
                      purchase_units: [{
                        amount: { value: total.toFixed(2), currency_code: 'EUR' },
                        description: `Donación por servicio de ${paymentModal.service_category}`
                      }]
                    });
                  }}
                  onApprove={async (data, actions) => {
                    await actions.order.capture();
                    try {
                      await fetch(`/api/appointments/${paymentModal.id}/status`, {
                        method: 'PATCH',
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status: 'paid' })
                      });
                      setAppointments(appointments.map(a => a.id === paymentModal.id ? { ...a, status: 'paid' } : a));
                      setPaymentModal(null);
                      alert('¡Donación completada con éxito! Gracias por tu contribución.');
                    } catch (err) {
                      console.error(err);
                      alert('Donación recibida pero hubo un error actualizando el estado.');
                    }
                  }}
                  onError={(err) => {
                    console.error('PayPal error:', err);
                    alert('Hubo un error con PayPal. Inténtalo de nuevo.');
                  }}
                />
              </div>

              <button onClick={() => setPaymentModal(null)} className="btn btn-outline" style={{ width: '100%' }}>Cancelar</button>
            </div>
          </div>
        );
      })()}
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
