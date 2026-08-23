#!/usr/bin/env node
import https from 'https';
import http from 'http';

const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
const token = process.env.AUTH_TOKEN;
const tourId = process.env.TOUR_ID;
const intervalMs = Number(process.env.INTERVAL_MS || 10000);

if (!token || !tourId) {
  console.error('Usage: AUTH_TOKEN=<token> TOUR_ID=<tour_id> node scripts/send-gps-demo.js');
  process.exit(1);
}

const sendLocation = () => {
  const payload = JSON.stringify({
    tour_id: Number(tourId),
    latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
    longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
    accuracy: 10 + Math.random() * 5
  });

  const url = new URL('/api/tracking/locations', baseUrl);
  const client = url.protocol === 'https:' ? https : http;

  const req = client.request(
    {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: `Bearer ${token}`
      }
    },
    (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log(`Sent GPS update: ${res.statusCode} ${data}`);
      });
    }
  );

  req.on('error', (error) => {
    console.error('Error sending GPS update', error.message);
  });

  req.write(payload);
  req.end();
};

sendLocation();
setInterval(sendLocation, intervalMs);
