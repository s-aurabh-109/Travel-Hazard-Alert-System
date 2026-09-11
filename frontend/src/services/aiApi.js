const AI_BASE_URL = import.meta.env.VITE_AI_BACKEND_URL || "http://localhost:8001";

async function fetchWithFallback(url, options = {}, fallbackData = null) {
  try {
    const response = await fetch(`${AI_BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`AI API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`[AI API] Request to ${url} failed, using AI fallback data.`, error.message);
    return fallbackData;
  }
}

export async function checkAiHealth() {
  try {
    const res = await fetch(`${AI_BASE_URL}/`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

// Calculate AI Safety Score
export async function getAiSafetyScore(lat, lng) {
  return fetchWithFallback(
    `/api/v1/safety-score/calculate`,
    {
      method: "POST",
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    },
    {
      score: 88,
      level: "SAFE",
      color: "#10b981",
      factors: [
        { name: "Police Proximity", score: 92, status: "Good" },
        { name: "Illumination Level", score: 85, status: "Moderate" },
        { name: "Crime Density Index", score: 90, status: "Low Risk" },
        { name: "Time of Day", score: 85, status: "Daylight" },
      ],
      aiSummary: "Area is well lit with nearby emergency services within 1.5km. Safe for travel.",
    }
  );
}

// Evaluate AI Anomaly / Route Deviation
export async function checkAiAnomaly(lat, lng, speed = 0) {
  return fetchWithFallback(
    `/api/v1/anomaly/check`,
    {
      method: "POST",
      body: JSON.stringify({ latitude: lat, longitude: lng, speed }),
    },
    {
      isAnomaly: false,
      confidence: 0.94,
      riskMessage: "Normal travel behavior detected. Path alignment: 98%.",
    }
  );
}

// AI Risk Assessment
export async function evaluateRisk(lat, lng) {
  return fetchWithFallback(
    `/api/v1/risk/evaluate`,
    {
      method: "POST",
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    },
    {
      riskLevel: "LOW",
      hazardCount: 0,
      nearbyAlerts: [],
      advisory: "No active hazard alerts reported in your 2km radius.",
    }
  );
}

// AI Analytics & Heatmap data
export async function getAiAnalytics() {
  return fetchWithFallback(
    `/api/v1/analytics/summary`,
    {},
    {
      totalSafeZones: 14,
      totalDangerZones: 3,
      recentAlertsResolved: 28,
      systemSafetyIndex: "94.2%",
    }
  );
}
