const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/server');

let userToken;
let adminToken;
let tourId;
let geofenceId;

test('Geofence Tests - Setup user and admin', async () => {
  const userResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Geofence User',
      email: `geofence-user-${Date.now()}@example.com`,
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

test('Geofence Tests - Create tour for geofence', async () => {
  const tourResponse = await request(app)
    .post('/api/tours')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Geofence Tour',
      description: 'Tour for geofence tests',
      location: 'Test Area',
      start_time: '2026-07-20T08:00:00Z',
      end_time: '2026-07-20T12:00:00Z'
    });
  assert.equal(tourResponse.status, 201);
  tourId = tourResponse.body.tour.id;
});

test('Geofence Tests - Create a geofence', async () => {
  const response = await request(app)
    .post('/api/geofences')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      tour_id: tourId,
      name: 'Test Geofence',
      latitude: 37.7749,
      longitude: -122.4194,
      radius_meters: 500
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.geofence.name, 'Test Geofence');
  geofenceId = response.body.geofence.id;
});

test('Geofence Tests - List geofences for tour', async () => {
  const response = await request(app)
    .get(`/api/geofences?tour_id=${tourId}`)
    .set('Authorization', `Bearer ${userToken}`);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.geofences));
  assert.ok(response.body.geofences.some((fence) => fence.id === geofenceId));
});

test('Geofence Tests - Evaluate inside geofence', async () => {
  const response = await request(app)
    .post(`/api/geofences/${geofenceId}/evaluate`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      latitude: 37.7750,
      longitude: -122.4195
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.inside, true);
});

test('Geofence Tests - Evaluate outside geofence and create alert', async () => {
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
});

test('Geofence Tests - Escalate geofence alert on repeated breach', async () => {
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
  assert.equal(response.body.alert.severity, 'critical');
});

test('Geofence Tests - Admin can list all geofences', async () => {
  const response = await request(app)
    .get('/api/geofences')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.geofences));
});

test('Geofence Tests - Unauthorized user cannot update geofence', async () => {
  const otherResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Other Geofence User',
      email: `other-geo-user-${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'user'
    });

  assert.equal(otherResponse.status, 201);
  const otherToken = otherResponse.body.token;

  const response = await request(app)
    .put(`/api/geofences/${geofenceId}`)
    .set('Authorization', `Bearer ${otherToken}`)
    .send({
      name: 'Hacked Geofence'
    });

  assert.equal(response.status, 403);
});
