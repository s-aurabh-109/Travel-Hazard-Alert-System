const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/server');

let userToken;
let adminToken;
let userId;
let tourId;
let geofenceId;
let alertId;

test('Workflow Integration - Register user and admin', async () => {
  const userResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Integration User',
      email: `integration-user-${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'user'
    });
  assert.equal(userResponse.status, 201);
  userToken = userResponse.body.token;
  userId = userResponse.body.user.id;

  const adminResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@example.com',
      password: 'Admin123!'
    });
  assert.equal(adminResponse.status, 200);
  adminToken = adminResponse.body.token;
});

test('Workflow Integration - Create tour', async () => {
  const response = await request(app)
    .post('/api/tours')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Integration Tour',
      description: 'Complete workflow integration tour',
      location: 'Integration City',
      start_time: '2026-07-20T08:00:00Z',
      end_time: '2026-07-20T12:00:00Z'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.tour.title, 'Integration Tour');
  tourId = response.body.tour.id;
});

test('Workflow Integration - Add emergency contact', async () => {
  const response = await request(app)
    .post('/api/emergency-contacts')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      name: 'Integration Contact',
      phone: '+1234567890',
      relationship: 'Friend',
      is_primary: true
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.contact.name, 'Integration Contact');
});

test('Workflow Integration - Create geofence', async () => {
  const response = await request(app)
    .post('/api/geofences')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      tour_id: tourId,
      name: 'Integration Geofence',
      latitude: 37.7749,
      longitude: -122.4194,
      radius_meters: 500
    });

  assert.equal(response.status, 201);
  geofenceId = response.body.geofence.id;
});

test('Workflow Integration - Save tracking location inside geofence', async () => {
  const response = await request(app)
    .post('/api/tracking/locations')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      tour_id: tourId,
      latitude: 37.7750,
      longitude: -122.4195,
      accuracy: 10.1
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.location.tour_id, tourId);
});

test('Workflow Integration - Evaluate geofence breach and create alert', async () => {
  const response = await request(app)
    .post(`/api/geofences/${geofenceId}/evaluate`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      latitude: 37.7840,
      longitude: -122.4300
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.inside, false);
  assert.equal(response.body.alert.type, 'geofence');
  assert.equal(response.body.alert.severity, 'high');
  alertId = response.body.alert.id;
});

test('Workflow Integration - Admin fetch latest location', async () => {
  const response = await request(app)
    .get(`/api/tracking/latest?user_id=${userId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.location.user_id, userId);
});

test('Workflow Integration - Admin send alert to user', async () => {
  const response = await request(app)
    .post('/api/admin/alert-user')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      user_id: userId,
      tour_id: tourId,
      message: 'Please report to admin base',
      severity: 'high'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.alert.type, 'admin');
});

test('Workflow Integration - Admin review escalation history', async () => {
  const response = await request(app)
    .get(`/api/escalation/history?user_id=${userId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.alerts));
});
