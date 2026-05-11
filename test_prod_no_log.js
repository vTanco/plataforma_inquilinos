async function test() {
  try {
    const email = `tech${Date.now()}@test.com`;
    // 1. Register a technician
    let res = await fetch('https://plataforma-inquilinos.onrender.com/api/auth/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: 'Tech Test',
        email: email,
        password: 'password123',
        role: 'technician',
        service_category: 'Fontanería',
        latitude: 40.0,
        longitude: -3.0
      })
    });
    let data = await res.json();
    console.log('Tech reg:', data);
    const techId = data.user.id;

    // 2. Register a tenant
    const tenantEmail = `tenant${Date.now()}@test.com`;
    res = await fetch('https://plataforma-inquilinos.onrender.com/api/auth/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: 'Tenant Test',
        email: tenantEmail,
        password: 'password123',
        role: 'tenant',
        latitude: 40.0,
        longitude: -3.0
      })
    });
    data = await res.json();
    console.log('Tenant reg:', data);
    const token = data.token;

    // 3. Create appointment with large payload (1MB) to simulate PDF
    const largeString = 'A'.repeat(1024 * 1024);
    res = await fetch('https://plataforma-inquilinos.onrender.com/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        technician_id: techId,
        service_category: 'Fontanería',
        appointment_date: new Date().toISOString(),
        signature: 'data:image/png;base64,iVBORw0KGgo...',
        pdf_document: 'data:application/pdf;base64,' + largeString
      })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response length:', text.length);
  } catch (err) {
    console.error(err);
  }
}
test();
