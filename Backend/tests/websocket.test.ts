const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const request = require('supertest');
const WebSocket = require('ws');
const app = require('../src/server');
const { registerWebSocketServer } = require('../src/utils/liveUpdates');

test('WebSocket broadcasts location updates to connected clients', async () => {
  const server = http.createServer(app);
  registerWebSocketServer(server);

  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Socket User',
        email: `socket-user-${Date.now()}@example.com`,
        password: 'Password123!',
        role: 'user'
      });

    assert.equal(userResponse.status, 201);
    const token = userResponse.body.token;

    const port = server.address().port;
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);

    await new Promise((resolve, reject) => {
      ws.once('open', resolve);
      ws.once('error', reject);
    });

    const message = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timed out waiting for websocket message')), 5000);
      ws.once('message', (data) => {
        clearTimeout(timer);
        resolve(data.toString());
      });

      request(app)
        .post('/api/tours')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Socket Tour',
          description: 'Tour for websocket testing',
          location: 'Test City',
          start_time: '2026-07-20T08:00:00Z',
          end_time: '2026-07-20T12:00:00Z'
        })
        .then((tourResponse) => {
          assert.equal(tourResponse.status, 201);
          return request(app)
            .post('/api/tracking/locations')
            .set('Authorization', `Bearer ${token}`)
            .send({
              tour_id: tourResponse.body.tour.id,
              latitude: 37.7749,
              longitude: -122.4194,
              accuracy: 8.5
            });
        })
        .then((trackingResponse) => {
          assert.equal(trackingResponse.status, 201);
        })
        .catch(reject);
    });

    assert.match(message, /location/i);

    ws.close();
  } finally {
    server.close();
  }
});
