const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/server');

let userToken;
let adminToken;
let tourId;
let alertId;

test('Alert Tests - Setup user and admin', async () => {
  const userResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Alert User',
      email: `alert-user-${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'user'
    });
  assert.equal(userResponse.status, 201);
  userToken = userResponse.body.token;

  const adminResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@example.com',
      password: 'Admin123!'
    });
  assert.equal(adminResponse.status, 200);
  adminToken = adminResponse.body.token;
});

test('Alert Tests - Create tour for alerts', async () => {
  const tourResponse = await request(app)
    .post('/api/tours')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Alert Tour',
      description: 'Tour used for alert tests',
      location: 'Test Park',
      start_time: '2026-07-20T08:00:00Z',
      end_time: '2026-07-20T12:00:00Z'
    });
  assert.equal(tourResponse.status, 201);
  tourId = tourResponse.body.tour.id;
});

test('Alert Tests - Create an alert', async () => {
  const response = await request(app)
    .post('/api/alerts')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      tour_id: tourId,
      type: 'medical',
      message: 'User needs medical attention',
      severity: 'high'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.alert.tour_id, tourId);
  assert.equal(response.body.alert.type, 'medical');
  alertId = response.body.alert.id;
});

test('Alert Tests - List own alerts', async () => {
  const response = await request(app)
    .get('/api/alerts')
    .set('Authorization', `Bearer ${userToken}`);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.alerts));
  assert.ok(response.body.alerts.some((alert) => alert.id === alertId));
});

test('Alert Tests - Update own alert status', async () => {
  const response = await request(app)
    .put(`/api/alerts/${alertId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ status: 'resolved' });

  assert.equal(response.status, 200);
  assert.equal(response.body.alert.status, 'resolved');
});

test('Alert Tests - Admin can list all alerts', async () => {
  const response = await request(app)
    .get('/api/admin/alerts')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.alerts));
  assert.ok(response.body.alerts.length > 0);
});

test('Alert Tests - Non-owner cannot update others alert', async () => {
  const otherResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Other User',
      email: `alert-other-${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'user'
    });
  assert.equal(otherResponse.status, 201);

  const otherToken = otherResponse.body.token;
  const response = await request(app)
    .put(`/api/alerts/${alertId}`)
    .set('Authorization', `Bearer ${otherToken}`)
    .send({ status: 'open' });

  assert.equal(response.status, 403);
  assert.equal(response.body.message, 'Not authorized to update this alert');
});

test('Alert Tests - Create alert missing fields fails', async () => {
  const response = await request(app)
    .post('/api/alerts')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      tour_id: tourId,
      message: 'Missing type field'
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'Tour ID, type, and message are required');
});
