const NODE_BASE_URL = (import.meta as any).env?.VITE_NODE_BACKEND_URL || "http://localhost:5000";

async function fetchWithFallback<T>(url: string, options: RequestInit = {}, fallbackData: T): Promise<T> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(`${NODE_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Node API error: ${response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (error: any) {
    console.warn(`[Node API] Request to ${url} failed, using fallback data.`, error?.message || error);
    return fallbackData;
  }
}

export async function checkNodeHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${NODE_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function loginUser(email: string, password: string) {
  return fetchWithFallback(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    {
      token: "mock-jwt-token-12345",
      user: { id: "u-1", name: email.split("@")[0] || "Tourist", email, role: "tourist" },
    }
  );
}

export async function registerUser(name: string, email: string, password: string, role = "tourist") {
  return fetchWithFallback(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    },
    {
      token: "mock-jwt-token-12345",
      user: { id: "u-1", name, email, role },
    }
  );
}

export async function sendGpsSnapshot(location: [number, number]) {
  return fetchWithFallback(
    "/api/tracking/gps",
    {
      method: "POST",
      body: JSON.stringify({
        latitude: location[0],
        longitude: location[1],
        timestamp: new Date().toISOString(),
      }),
    },
    { status: "recorded", location }
  );
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: "danger" | "safe";
  coordinates: [number, number];
  radius: number;
}

export async function getGeofences(): Promise<GeofenceZone[]> {
  return fetchWithFallback("/api/geofences", {}, [
    {
      id: "gf-1",
      name: "High Crime Warning Area - Night Patrol Zone",
      type: "danger",
      coordinates: [20.595, 78.965],
      radius: 1200,
    },
    {
      id: "gf-2",
      name: "Tourist Safe Corridor - Central Police Area",
      type: "safe",
      coordinates: [20.59, 78.96],
      radius: 2000,
    },
  ]);
}

export async function triggerSosAlert(location: [number, number], message = "EMERGENCY PANIC ALERT!") {
  return fetchWithFallback(
    "/api/alerts",
    {
      method: "POST",
      body: JSON.stringify({
        latitude: location[0],
        longitude: location[1],
        alertType: "SOS_PANIC",
        message,
        createdAt: new Date().toISOString(),
      }),
    },
    {
      id: `sos-${Date.now()}`,
      status: "DISPATCHED",
      message,
      location,
      timestamp: new Date().toISOString(),
    }
  );
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  return fetchWithFallback("/api/emergency-contacts", {}, [
    { id: "ec-1", name: "Police Control Room", phone: "112", relation: "National Emergency" },
    { id: "ec-2", name: "Women Safety Helpline", phone: "1091", relation: "24x7 Helpline" },
    { id: "ec-3", name: "Tourist Support Patrol", phone: "1363", relation: "Tourist Helpline" },
    { id: "ec-4", name: "Primary Contact (Mom)", phone: "+91 9876543210", relation: "Family" },
  ]);
}
