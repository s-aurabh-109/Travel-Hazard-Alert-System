const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/server');

let userToken;
let otherUserToken;
let contactId;

test('Emergency Contacts - Register primary user', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Contact User',
      email: `contact-user-${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'user'
    });

  assert.equal(response.status, 201);
  userToken = response.body.token;
});

test('Emergency Contacts - Create a contact', async () => {
  const response = await request(app)
    .post('/api/emergency-contacts')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      name: 'Jane Doe',
      phone: '+1234567890',
      relationship: 'Spouse',
      is_primary: true
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.contact.name, 'Jane Doe');
  contactId = response.body.contact.id;
});

test('Emergency Contacts - List own contacts', async () => {
  const response = await request(app)
    .get('/api/emergency-contacts')
    .set('Authorization', `Bearer ${userToken}`);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.contacts));
  assert.ok(response.body.contacts.some((contact) => contact.id === contactId));
});

test('Emergency Contacts - Update contact', async () => {
  const response = await request(app)
    .put(`/api/emergency-contacts/${contactId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      phone: '+1987654321'
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.contact.phone, '+1987654321');
});

test('Emergency Contacts - Register another user', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Other User',
      email: `other-user-${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'user'
    });

  assert.equal(response.status, 201);
  otherUserToken = response.body.token;
});

test('Emergency Contacts - Prevent other user from updating contact', async () => {
  const response = await request(app)
    .put(`/api/emergency-contacts/${contactId}`)
    .set('Authorization', `Bearer ${otherUserToken}`)
    .send({
      phone: '+1111111111'
    });

  assert.equal(response.status, 403);
  assert.equal(response.body.message, 'Not authorized to update this contact');
});

test('Emergency Contacts - Delete contact', async () => {
  const response = await request(app)
    .delete(`/api/emergency-contacts/${contactId}`)
    .set('Authorization', `Bearer ${userToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.message, 'Emergency contact deleted successfully');
});
