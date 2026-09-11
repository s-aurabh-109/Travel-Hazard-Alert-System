const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/server');

let userToken;
let adminToken;
let userId;
let tourId;
let locationId;

test('Tracking Tests - Setup user, admin and tour', async () => {
  const userResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Tracking User',
      email: `tracking-user-${Date.now()}@example.com`,
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

  const tourResponse = await request(app)
    .post('/api/tours')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Tracking Tour',
      description: 'Tour for tracking tests',
      location: 'Test Area',
      start_time: '2026-07-20T08:00:00Z',
      end_time: '2026-07-20T12:00:00Z'
    });
  assert.equal(tourResponse.status, 201);
  tourId = tourResponse.body.tour.id;
});

test('Tracking Tests - Save a GPS location', async () => {
  const response = await request(app)
    .post('/api/tracking/locations')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      tour_id: tourId,
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 12.5
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.location.user_id, userId);
  locationId = response.body.location.id;
});

test('Tracking Tests - Fetch own location history', async () => {
  const response = await request(app)
    .get('/api/tracking/locations')
    .set('Authorization', `Bearer ${userToken}`);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.locations));
  assert.ok(response.body.locations.some((item) => item.id === locationId));
});

test('Tracking Tests - Admin can fetch latest location for a user', async () => {
  const response = await request(app)
    .get(`/api/tracking/latest?user_id=${userId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.location.user_id, userId);
});

test('Tracking Tests - Admin can list latest locations for monitored users', async () => {
  const response = await request(app)
    .get('/api/admin/locations')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.locations));
  assert.ok(response.body.locations.some((location) => location.user_id === userId));
});

test('Tracking Tests - Admin can alert a user from tracking data', async () => {
  const response = await request(app)
    .post('/api/admin/alert-user')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      user_id: userId,
      tour_id: tourId,
      message: 'Please check in with the admin desk',
      severity: 'high'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.alert.user_id, userId);
  assert.equal(response.body.alert.type, 'admin');
});
