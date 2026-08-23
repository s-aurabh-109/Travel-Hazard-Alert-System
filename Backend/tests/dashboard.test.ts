const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/server');

test('Admin dashboard summary returns counts and recent activity', async () => {
  const adminResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@example.com',
      password: 'Admin123!'
    });

  assert.equal(adminResponse.status, 200);
  const adminToken = adminResponse.body.token;

  const userResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Dashboard User',
      email: `dashboard-user-${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'user'
    });

  assert.equal(userResponse.status, 201);
  const userId = userResponse.body.user.id;

  const tourResponse = await request(app)
    .post('/api/tours')
    .set('Authorization', `Bearer ${userResponse.body.token}`)
    .send({
      title: 'Dashboard Tour',
      description: 'For dashboard testing',
      location: 'Test City',
      start_time: '2026-07-20T08:00:00Z',
      end_time: '2026-07-20T12:00:00Z'
    });

  assert.equal(tourResponse.status, 201);
  const tourId = tourResponse.body.tour.id;

  await request(app)
    .post('/api/alerts')
    .set('Authorization', `Bearer ${userResponse.body.token}`)
    .send({
      tour_id: tourId,
      type: 'medical',
      message: 'Needs assistance',
      severity: 'high'
    });

  await request(app)
    .post('/api/tracking/locations')
    .set('Authorization', `Bearer ${userResponse.body.token}`)
    .send({
      tour_id: tourId,
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 8.5
    });

  const response = await request(app)
    .get('/api/admin/dashboard')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
  assert.ok(response.body.summary);
  assert.equal(response.body.summary.total_tours >= 1, true);
  assert.equal(response.body.summary.open_alerts >= 1, true);
  assert.equal(response.body.summary.active_users >= 1, true);
  assert.ok(Array.isArray(response.body.recent_alerts));
});
