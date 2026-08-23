# Smart Safety Tour API - Postman Testing Guide

## Prerequisites
- Postman installed
- Backend running at http://localhost:5001
- PostgreSQL running through Docker

## Postman Setup

### Option 1: Import the ready-made files
- Environment: [postman/Smart_Safety_Tour_App.postman_environment.json](postman/Smart_Safety_Tour_App.postman_environment.json)
- Collection: [postman/Smart_Safety_Tour_App.postman_collection.json](postman/Smart_Safety_Tour_App.postman_collection.json)

### Option 2: Create the environment manually
Create a Postman environment with these variables:
- `base_url = http://localhost:5001`
- `user_token = `
- `admin_token = `
- `other_user_token = `
- `user_id = `
- `tour_id = `
- `alert_id = `
- `contact_id = `
- `geofence_id = `

## Health Check

**URL:** `GET http://localhost:5001/health`

**Expected Response:** 200 OK
```json
{
  "status": "ok"
}
```

---

## Authentication Flow

### 1) Register a user

**URL:** `POST http://localhost:5001/api/auth/register`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "role": "user"
}
```

**Expected Response:** 201 Created

Save the returned token as `user_token` and the user id as `user_id`.

### 2) Log in the user

**URL:** `POST http://localhost:5001/api/auth/login`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Expected Response:** 200 OK

### 3) Fetch profile

**URL:** `GET http://localhost:5001/api/profile`

**Headers:**
```http
Authorization: Bearer {{user_token}}
```

**Expected Response:** 200 OK
```json
{
  "message": "Profile route",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## Tour Flow

### 4) Create a tour

**URL:** `POST http://localhost:5001/api/tours`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer {{user_token}}
```

**Body:**
```json
{
  "title": "Mountain Safety Tour",
  "description": "Guided tour through mountain trails",
  "location": "Rocky Mountains, Colorado",
  "start_time": "2026-07-15T08:00:00Z",
  "end_time": "2026-07-15T18:00:00Z"
}
```

**Expected Response:** 201 Created

Save the returned tour id as `tour_id`.

### 5) Create a second tour

**URL:** `POST http://localhost:5001/api/tours`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer {{user_token}}
```

**Body:**
```json
{
  "title": "Beach Safety Walk",
  "description": "Coastal walk with safety checkpoints",
  "location": "Miami Beach, Florida",
  "start_time": "2026-08-01T09:00:00Z",
  "end_time": "2026-08-01T15:00:00Z"
}
```

### 6) List tours

**URL:** `GET http://localhost:5001/api/tours`

**Headers:**
```http
Authorization: Bearer {{user_token}}
```

**Expected Response:** 200 OK

### 7) Get a single tour

**URL:** `GET http://localhost:5001/api/tours/{{tour_id}}`

**Headers:**
```http
Authorization: Bearer {{user_token}}
```

### 8) Update a tour

**URL:** `PUT http://localhost:5001/api/tours/{{tour_id}}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer {{user_token}}
```

**Body:**
```json
{
  "title": "Updated Mountain Safety Tour",
  "description": "Enhanced tour with new checkpoints",
  "status": "completed"
}
```

### 9) Delete a tour

**URL:** `DELETE http://localhost:5001/api/tours/{{tour_id}}`

**Headers:**
```http
Authorization: Bearer {{user_token}}
```

### Error cases
- Without a token: `PUT /api/tours/{{tour_id}}` returns 401
- With a non-existent id: `GET /api/tours/99999` returns 404
- Missing title/location: `POST /api/tours` returns 400

---

## Alert Flow

### 10) Create an alert

**URL:** `POST http://localhost:5001/api/alerts`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer {{user_token}}
```

**Body:**
```json
{
  "tour_id": {{tour_id}},
  "type": "medical",
  "message": "User requires medical attention",
  "severity": "high"
}
```

**Expected Response:** 201 Created

Save the returned alert id as `alert_id`.

### 11) List your alerts

**URL:** `GET http://localhost:5001/api/alerts`

**Headers:**
```http
Authorization: Bearer {{user_token}}
```

### 12) Update alert status

**URL:** `PUT http://localhost:5001/api/alerts/{{alert_id}}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer {{user_token}}
```

**Body:**
```json
{
  "status": "resolved"
}
```

### 13) Admin list all alerts

**URL:** `GET http://localhost:5001/api/admin/alerts`

**Headers:**
```http
Authorization: Bearer {{admin_token}}
```

---

## Emergency Contact Flow

### 14) Create an emergency contact

**URL:** `POST http://localhost:5001/api/emergency-contacts`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer {{user_token}}
```

**Body:**
```json
{
  "name": "Jane Doe",
  "phone": "+1234567890",
  "relationship": "Spouse",
  "is_primary": true
}
```

Save the returned contact id as `contact_id`.

### 15) List contacts

**URL:** `GET http://localhost:5001/api/emergency-contacts`

**Headers:**
```http
Authorization: Bearer {{user_token}}
```

### 16) Update a contact

**URL:** `PUT http://localhost:5001/api/emergency-contacts/{{contact_id}}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer {{user_token}}
```

**Body:**
```json
{
  "phone": "+1987654321"
}
```

### 17) Delete a contact

**URL:** `DELETE http://localhost:5001/api/emergency-contacts/{{contact_id}}`

**Headers:**
```http
Authorization: Bearer {{user_token}}
```

---

## Geofence Flow

### 18) Create a geofence

**URL:** `POST http://localhost:5001/api/geofences`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer {{user_token}}
```

**Body:**
```json
{
  "tour_id": {{tour_id}},
  "name": "Test Geofence",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "radius_meters": 500
}
```

Save the returned geofence id as `geofence_id`.

### 19) List geofences for the tour

**URL:** `GET http://localhost:5001/api/geofences?tour_id={{tour_id}}`

**Headers:**
```http
Authorization: Bearer {{user_token}}
```

### 20) Evaluate a point inside the geofence

**URL:** `POST http://localhost:5001/api/geofences/{{geofence_id}}/evaluate`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer {{user_token}}
```

**Body:**
```json
{
  "latitude": 37.7750,
  "longitude": -122.4195
}
```

### 21) Evaluate a point outside the geofence

**URL:** `POST http://localhost:5001/api/geofences/{{geofence_id}}/evaluate`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer {{user_token}}
```

**Body:**
```json
{
  "latitude": 37.7840,
  "longitude": -122.4300
}
```

This should create or escalate a geofence-related alert.

---

## GPS Tracking Flow

### 22) Save a GPS location

**URL:** `POST http://localhost:5001/api/tracking/locations`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer {{user_token}}
```

**Body:**
```json
{
  "tour_id": {{tour_id}},
  "latitude": 37.7749,
  "longitude": -122.4194,
  "accuracy": 12.5
}
```

### 23) Fetch your tracking history

**URL:** `GET http://localhost:5001/api/tracking/locations`

**Headers:**
```http
Authorization: Bearer {{user_token}}
```

### 24) Admin fetch latest location for a user

**URL:** `GET http://localhost:5001/api/tracking/latest?user_id={{user_id}}`

**Headers:**
```http
Authorization: Bearer {{admin_token}}
```

---

## Admin Monitoring and Escalation Flow

### 25) Register an admin user

**URL:** `POST http://localhost:5001/api/auth/register`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "AdminPass123!",
  "role": "admin"
}
```

Save the response token as `admin_token`.

### 26) Admin list monitored locations

**URL:** `GET http://localhost:5001/api/admin/locations`

**Headers:**
```http
Authorization: Bearer {{admin_token}}
```

### 27) Admin send an alert to a user

**URL:** `POST http://localhost:5001/api/admin/alert-user`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body:**
```json
{
  "user_id": {{user_id}},
  "tour_id": {{tour_id}},
  "message": "Please check in with the admin desk",
  "severity": "high"
}
```

### 28) Admin trigger an escalation alert

**URL:** `POST http://localhost:5001/api/escalation/trigger`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body:**
```json
{
  "user_id": {{user_id}},
  "tour_id": {{tour_id}},
  "message": "User left the safe zone",
  "severity": "critical",
  "type": "escalation"
}
```

### 29) Admin review escalation history

**URL:** `GET http://localhost:5001/api/escalation/history?user_id={{user_id}}`

**Headers:**
```http
Authorization: Bearer {{admin_token}}
```

---

## WebSocket Live Updates

The backend broadcasts live updates for new location posts and alerts over WebSocket.

### Connect to the live update stream
- URL: `ws://localhost:5001`
- Use any WebSocket client or browser tool

### Browser test snippet
Open your browser console and run:
```js
const ws = new WebSocket('ws://localhost:5001');
ws.onopen = () => console.log('WebSocket connected');
ws.onmessage = (event) => console.log('Live update:', JSON.parse(event.data));
ws.onclose = () => console.log('WebSocket closed');
ws.onerror = (error) => console.error('WebSocket error', error);
```

### Sample messages
```json
{
  "type": "location",
  "user_id": 1,
  "tour_id": 2,
  "location": {
    "id": 1,
    "latitude": 37.7749,
    "longitude": -122.4194,
    "accuracy": 12.5,
    "created_at": "2026-06-30T...Z"
  }
}
```

```json
{
  "type": "alert",
  "alert": {
    "id": 1,
    "tour_id": 2,
    "user_id": 1,
    "type": "medical",
    "message": "User requires medical attention",
    "severity": "high",
    "status": "open"
  }
}
```

### Demo GPS sender
A helper script is available at `scripts/send-gps-demo.js`.
Run it with:
```bash
AUTH_TOKEN=<your_user_token> TOUR_ID=<your_tour_id> node scripts/send-gps-demo.js
```
This sends a new location update every 10 seconds.

---

## Helpful Tips

1. Use Postman variables for `user_token`, `admin_token`, `tour_id`, `alert_id`, `contact_id`, and `geofence_id`.
2. Run the auth requests first so the token is available for the rest of the workflow.
3. Use the geofence and tracking steps together for realistic safety-tour demonstrations.
4. Re-run the register/login requests if a token expires.

---

## Remaining Tasks

- Add a simple frontend or mobile client to automatically send GPS updates during tours.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Make sure the token is included in the Authorization header |
| 404 Not Found | Verify the referenced id exists before calling the endpoint |
| 400 Bad Request | Check that required fields such as title, location, or coordinates are present |
| 500 Error | Review the backend logs and confirm PostgreSQL is running |
| CORS Error | The backend is already configured for CORS; if it appears, confirm the server is running on the expected port |
