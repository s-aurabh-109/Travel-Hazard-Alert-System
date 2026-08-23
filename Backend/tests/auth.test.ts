const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/server');

test('registers a user and returns a token', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: `test-user-${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'user'
    });

  assert.equal(response.status, 201);
  assert.ok(response.body.token);
  assert.equal(response.body.user.role, 'user');
});

test('rejects attempts to create an admin account through registration', async () => {
  const email = `attempted-admin-${Date.now()}@example.com`;
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Attempted Admin',
      email,
      password: 'Password123!',
      role: 'admin'
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'Admin role is reserved for the seeded admin account');

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email,
      password: 'Password123!'
    });

  assert.equal(loginResponse.status, 401);
});

test('denies access to admin routes for non-admin users', async () => {
  const userEmail = `non-admin-${Date.now()}@example.com`;

  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Non Admin User',
      email: userEmail,
      password: 'Password123!',
      role: 'user'
    });

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: userEmail,
      password: 'Password123!'
    });

  const response = await request(app)
    .get('/api/admin/users')
    .set('Authorization', `Bearer ${loginResponse.body.token}`);

  assert.equal(response.status, 403);
  assert.equal(response.body.message, 'Access denied');
});

test('seeds a default admin user on startup', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@example.com',
      password: 'Admin123!'
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.user.role, 'admin');
});
