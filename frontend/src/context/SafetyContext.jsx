import { createContext, useContext, useState, useEffect } from "react";
import { getAiSafetyScore, checkAiHealth } from "../services/aiApi";
import { getGeofences, sendGpsSnapshot, triggerSosAlert, checkNodeHealth } from "../services/nodeApi";

const SafetyContext = createContext();

export function SafetyProvider({ children }) {
  const [userLocation, setUserLocation] = useState([20.5937, 78.9629]); // Default to central coordinates
  const [safetyScore, setSafetyScore] = useState({
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
  });

  const [geofences, setGeofences] = useState([]);
  const [isSosActive, setIsSosActive] = useState(false);
  const [sosStatus, setSosStatus] = useState(null);
  const [isNodeOnline, setIsNodeOnline] = useState(false);
  const [isAiOnline, setIsAiOnline] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Poll backend health on startup
  useEffect(() => {
    async function checkBackends() {
      const nodeOk = await checkNodeHealth();
      const aiOk = await checkAiHealth();
      setIsNodeOnline(nodeOk);
      setIsAiOnline(aiOk);
    }
    checkBackends();
    const timer = setInterval(checkBackends, 15000);
    return () => clearInterval(timer);
  }, []);

  // Fetch geofences
  useEffect(() => {
    async function fetchZones() {
      const zones = await getGeofences();
      if (zones) setGeofences(zones);
    }
    fetchZones();
  }, []);

  // Recalculate AI score when user location changes significantly
  useEffect(() => {
    async function updateSafetyScore() {
      if (!userLocation) return;
      const data = await getAiSafetyScore(userLocation[0], userLocation[1]);
      if (data) {
        setSafetyScore(data);
      }
      // Send location snapshot to Node backend
      sendGpsSnapshot(userLocation);
    }
    updateSafetyScore();
  }, [userLocation]);

  // Request browser geolocation
  const refreshLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
      },
      (err) => {
        console.warn("Geolocation permission or position error:", err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // SOS Trigger function
  const triggerSos = async (customMessage) => {
    setIsSosActive(true);
    const res = await triggerSosAlert(userLocation, customMessage);
    setSosStatus(res);
    return res;
  };

  const cancelSos = () => {
    setIsSosActive(false);
    setSosStatus(null);
  };

  return (
    <SafetyContext.Provider
      value={{
        userLocation,
        setUserLocation,
        safetyScore,
        geofences,
        isSosActive,
        sosStatus,
        isNodeOnline,
        isAiOnline,
        isLocating,
        refreshLocation,
        triggerSos,
        cancelSos,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  return useContext(SafetyContext);
}
