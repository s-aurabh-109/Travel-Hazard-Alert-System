const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/server');

let userToken;
let adminToken;
let tourId;

test('Tour Tests - Setup: Register users', async () => {
  const userResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Tour User',
      email: `tour-user-${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'user'
    });

  assert.equal(userResponse.status, 201);
  userToken = userResponse.body.token;
});

test('Tour Tests - Setup: Register admin', async () => {
  const adminResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@example.com',
      password: 'Admin123!'
    });

  assert.equal(adminResponse.status, 200);
  adminToken = adminResponse.body.token;
});

test('Tour Tests - Create a tour', async () => {
  const response = await request(app)
    .post('/api/tours')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Mountain Safety Tour',
      description: 'A guided tour through mountain trails',
      location: 'Rocky Mountains',
      start_time: '2026-07-01T09:00:00Z',
      end_time: '2026-07-01T17:00:00Z'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.tour.title, 'Mountain Safety Tour');
  tourId = response.body.tour.id;
});

test('Tour Tests - Get all tours', async () => {
  const response = await request(app)
    .get('/api/tours')
    .set('Authorization', `Bearer ${userToken}`);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.tours));
  assert.ok(response.body.tours.length > 0);
});

test('Tour Tests - Get single tour', async () => {
  const response = await request(app)
    .get(`/api/tours/${tourId}`)
    .set('Authorization', `Bearer ${userToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.tour.id, tourId);
  assert.equal(response.body.tour.title, 'Mountain Safety Tour');
});

test('Tour Tests - Update tour by creator', async () => {
  const response = await request(app)
    .put(`/api/tours/${tourId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Updated Mountain Safety Tour',
      status: 'completed'
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.tour.title, 'Updated Mountain Safety Tour');
  assert.equal(response.body.tour.status, 'completed');
});

test('Tour Tests - Delete tour by creator', async () => {
  const response = await request(app)
    .delete(`/api/tours/${tourId}`)
    .set('Authorization', `Bearer ${userToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.message, 'Tour deleted successfully');
});

test('Tour Tests - Get non-existent tour returns 404', async () => {
  const response = await request(app)
    .get('/api/tours/99999')
    .set('Authorization', `Bearer ${userToken}`);

  assert.equal(response.status, 404);
  assert.equal(response.body.message, 'Tour not found');
});

test('Tour Tests - Create tour without auth returns 401', async () => {
  const response = await request(app)
    .post('/api/tours')
    .send({
      title: 'Test Tour',
      location: 'Test Location'
    });

  assert.equal(response.status, 401);
});
