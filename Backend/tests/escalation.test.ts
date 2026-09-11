const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/server');

let adminToken;
let userToken;
let userId;
let tourId;

test('Escalation Tests - Setup admin, user and tour', async () => {
  const adminResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@example.com',
      password: 'Admin123!'
    });
  assert.equal(adminResponse.status, 200);
  adminToken = adminResponse.body.token;

  const userResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Escalation User',
      email: `escalation-user-${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'user'
    });
  assert.equal(userResponse.status, 201);
  userToken = userResponse.body.token;
  userId = userResponse.body.user.id;

  const tourResponse = await request(app)
    .post('/api/tours')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Escalation Tour',
      description: 'Tour for escalation tests',
      location: 'Test Area',
      start_time: '2026-07-20T08:00:00Z',
      end_time: '2026-07-20T12:00:00Z'
    });
  assert.equal(tourResponse.status, 201);
  tourId = tourResponse.body.tour.id;
});

test('Escalation Tests - Admin can create escalation alert', async () => {
  const response = await request(app)
    .post('/api/escalation/trigger')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      user_id: userId,
      tour_id: tourId,
      message: 'User left the safe zone',
      severity: 'critical',
      type: 'escalation'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.alert.user_id, userId);
  assert.equal(response.body.alert.severity, 'critical');
});

test('Escalation Tests - Admin can fetch escalation history', async () => {
  const response = await request(app)
    .get(`/api/escalation/history?user_id=${userId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.alerts));
});
