import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Ephemeral port

// Dynamically import compiled server dist
const { app } = await import('../dist/index.js');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    if (typeof server.closeAllConnections === 'function') {
      server.closeAllConnections();
    }
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Backend API Security, Authentication & GDPR Suite', async (t) => {
  let authToken = '';

  await t.test('1. Health check returns 200 OK and valid metadata', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.auth_enabled, true);
    assert.equal(data.security, 'scrypt-hmac-sha256');
  });

  await t.test('2. Unauthenticated request to /api/collabs is rejected with 401', async () => {
    const res = await fetch(`${baseUrl}/api/collabs`);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.error, /Authentication required/i);
  });

  await t.test('3. Login with invalid password fails with 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aarav@tech.com',
        password: 'wrongpassword'
      })
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  await t.test('4. Login with demo credentials succeeds and issues valid JWT', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aarav@tech.com',
        password: 'password123'
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token, 'Token must be issued upon successful login');
    assert.equal(data.user.email, 'aarav@tech.com');
    authToken = data.token;
  });

  await t.test('5. Authenticated creator can access their isolated collaborations', async () => {
    const res = await fetch(`${baseUrl}/api/collabs`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data), 'Should return an array of collabs under data');
  });

  await t.test('6. Admin telemetry endpoint complies strictly with GDPR Art. 25 (zero financial leak)', async () => {
    const res = await fetch(`${baseUrl}/api/admin/metrics`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.total_onboarded_users >= 1420);
    assert.ok(data.data.click_through_rates.overall_campaign_ctr > 0);
    assert.equal(data.gdpr_compliance.status, 'VERIFIED_COMPLIANT');

    // Verify zero financial details are exposed in cohorts
    const cohorts = data.data.cohorts || [];
    assert.ok(cohorts.length > 0, 'Should return anonymized cohorts');
    for (const c of cohorts) {
      assert.equal(c.deal_amount, undefined, 'Cohorts must not expose deal_amount');
      assert.equal(c.amount_paid, undefined, 'Cohorts must not expose amount_paid');
      assert.equal(c.privacy_status, 'GDPR_PROTECTED');
    }
  });

  await t.test('7. Unknown route returns 404 with structured JSON error', async () => {
    const res = await fetch(`${baseUrl}/api/non-existent-route`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error, 'Endpoint not found.');
  });
  await t.test('8. Phone SMS OTP flow: request OTP and verify OTP issues JWT token', async () => {
    const testPhone = '+919988776655';
    
    // Step 1: Send SMS OTP
    const sendRes = await fetch(`${baseUrl}/api/auth/send-sms-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone })
    });
    assert.equal(sendRes.status, 200);
    const sendData = await sendRes.json();
    assert.equal(sendData.success, true);
    assert.ok(sendData.preview_code, 'Sandbox preview_code should be returned');
    assert.equal(sendData.normalized_phone, testPhone);

    // Step 2: Verify SMS OTP
    const verifyRes = await fetch(`${baseUrl}/api/auth/verify-sms-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: testPhone,
        otp: sendData.preview_code,
        name: 'SMS Test Creator'
      })
    });
    assert.equal(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.equal(verifyData.success, true);
    assert.ok(verifyData.token, 'Should issue JWT token upon phone verification');
    assert.equal(verifyData.user.name, 'SMS Test Creator');
    assert.equal(verifyData.user.phone, testPhone);
  });
});
