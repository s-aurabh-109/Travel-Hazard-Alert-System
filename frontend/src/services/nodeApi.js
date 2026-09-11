const NODE_BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || "http://localhost:5000";

// Helper to make API requests with graceful error fallback
async function fetchWithFallback(url, options = {}, fallbackData = null) {
  try {
    const token = localStorage.getItem("auth_token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${NODE_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Node API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`[Node API] Request to ${url} failed, using fallback data.`, error.message);
    return fallbackData;
  }
}

// Check backend health
export async function checkNodeHealth() {
  try {
    const res = await fetch(`${NODE_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

// Auth API
export async function loginUser(email, password) {
  return fetchWithFallback("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, {
    token: "mock-jwt-token-12345",
    user: { id: "u-1", name: email.split("@")[0] || "Tourist", email, role: "tourist" }
  });
}

export async function registerUser(name, email, password, role = "tourist") {
  return fetchWithFallback("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  }, {
    token: "mock-jwt-token-12345",
    user: { id: "u-1", name, email, role }
  });
}

// GPS Tracking
export async function sendGpsSnapshot(location) {
  return fetchWithFallback("/api/tracking/gps", {
    method: "POST",
    body: JSON.stringify({
      latitude: location[0],
      longitude: location[1],
      timestamp: new Date().toISOString(),
    }),
  }, { status: "recorded", location });
}

// Geofences
export async function getGeofences() {
  return fetchWithFallback("/api/geofences", {}, [
    {
      id: "gf-1",
      name: "High Danger Zone - Night Warning",
      type: "danger",
      coordinates: [20.595, 78.965],
      radius: 1200, // meters
    },
    {
      id: "gf-2",
      name: "Tourist Safe Zone - Central Area",
      type: "safe",
      coordinates: [20.590, 78.960],
      radius: 2000,
    }
  ]);
}

// SOS Alert
export async function triggerSosAlert(location, message = "Emergency SOS Alert Triggered!") {
  return fetchWithFallback("/api/alerts", {
    method: "POST",
    body: JSON.stringify({
      latitude: location[0],
      longitude: location[1],
      alertType: "SOS_PANIC",
      message,
      createdAt: new Date().toISOString(),
    }),
  }, {
    id: `sos-${Date.now()}`,
    status: "DISPATCHED",
    message,
    location,
    timestamp: new Date().toISOString(),
  });
}

// Emergency Contacts
export async function getEmergencyContacts() {
  return fetchWithFallback("/api/emergency-contacts", {}, [
    { id: "ec-1", name: "Police Emergency", phone: "112", relation: "Authority" },
    { id: "ec-2", name: "Women Helpline", phone: "1091", relation: "Helpline" },
    { id: "ec-3", name: "Tourist Patrol", phone: "1363", relation: "Helpline" },
    { id: "ec-4", name: "Primary Contact (Family)", phone: "+91 9876543210", relation: "Family" },
  ]);
}
