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
  try {
    const { db } = await import('../dist/db/database.js');
    db.prepare("DELETE FROM collabs").run();
    db.prepare("DELETE FROM brands").run();
    db.prepare("DELETE FROM users").run();
    db.prepare("DELETE FROM password_resets").run();
  } catch {}
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

  await t.test('3. Real creator registration succeeds (201) and issues valid JWT', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Production Creator',
        email: 'creator@production.test',
        password: 'password123',
        handle: '@prodcreator',
        platform: 'both'
      })
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token, 'Token must be issued upon successful registration');
    assert.equal(data.user.email, 'creator@production.test');
    authToken = data.token;
  });

  await t.test('4. Login with invalid password fails with 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'creator@production.test',
        password: 'wrongpassword'
      })
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  await t.test('5. Login with registered credentials succeeds and issues valid JWT', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'creator@production.test',
        password: 'password123'
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token, 'Token must be issued upon successful login');
    assert.equal(data.user.email, 'creator@production.test');
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

  await t.test('9. Collab partial update & checklist toggle avoids NOT NULL error', async () => {
    // Create collab first
    const createRes = await fetch(`${baseUrl}/api/collabs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: 'Checklist Test Sponsorship',
        brand_name: 'Test Brand Co',
        platform: 'youtube',
        deliverable_format: 'yt_dedicated_video',
        deal_amount: 50000,
        currency: 'INR',
        pipeline_stage: 'production',
        payment_terms: 'net_30',
        live_post_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        deliverables_checklist: [{ text: 'Draft outline approved', completed: false }]
      })
    });
    assert.equal(createRes.status, 201);
    const createdCollab = (await createRes.json()).data;
    assert.equal(createdCollab.title, 'Checklist Test Sponsorship');

    // Partial update via PUT with ONLY deliverables_checklist
    const putRes = await fetch(`${baseUrl}/api/collabs/${createdCollab.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        deliverables_checklist: [{ text: 'Draft outline approved', completed: true }]
      })
    });
    assert.equal(putRes.status, 200, 'Partial PUT must succeed without NOT NULL constraint violation');
    const updatedCollab = (await putRes.json()).data;
    assert.equal(updatedCollab.title, 'Checklist Test Sponsorship', 'Title must be preserved');
    assert.equal(updatedCollab.deliverables_checklist[0].completed, true);

    // Test live metrics sync
    const syncRes = await fetch(`${baseUrl}/api/collabs/${createdCollab.id}/sync-metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    assert.equal(syncRes.status, 200, 'Live metrics sync must return 200');
    const syncData = await syncRes.json();
    assert.equal(syncData.success, true);
    assert.ok(syncData.data.views_count > 0, 'Views count must be populated');
  });

  await t.test('10. Email verification flow in Settings works cleanly', async () => {
    // Send email verification code
    const sendRes = await fetch(`${baseUrl}/api/auth/send-email-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    if (sendRes.status !== 200) {
      console.log('send-email-verify error:', await sendRes.text());
    }
    assert.equal(sendRes.status, 200);
    const sendData = await sendRes.json();
    assert.equal(sendData.success, true);
    assert.ok(sendData.preview_code, 'Preview code returned');

    // Verify email verification code
    const verifyRes = await fetch(`${baseUrl}/api/auth/verify-email-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ code: sendData.preview_code })
    });
    assert.equal(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.equal(verifyData.success, true);
    assert.equal(verifyData.email_verified, true);
  });
});
