import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getAiSafetyScore, checkAiHealth, type AiSafetyScoreData } from "../services/aiApi";
import { getGeofences, sendGpsSnapshot, triggerSosAlert, checkNodeHealth, type GeofenceZone } from "../services/nodeApi";

interface SafetyContextType {
  userLocation: [number, number];
  setUserLocation: (loc: [number, number]) => void;
  safetyScore: AiSafetyScoreData;
  geofences: GeofenceZone[];
  isSosActive: boolean;
  sosStatus: any;
  isNodeOnline: boolean;
  isAiOnline: boolean;
  isLocating: boolean;
  refreshLocation: () => void;
  triggerSos: (msg?: string) => Promise<any>;
  cancelSos: () => void;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export function SafetyProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocation] = useState<[number, number]>([20.5937, 78.9629]);
  const [safetyScore, setSafetyScore] = useState<AiSafetyScoreData>({
    score: 88,
    level: "SAFE",
    color: "#10b981",
    factors: [
      { name: "Police Proximity", score: 92, status: "Good (1.2km)" },
      { name: "Illumination Level", score: 85, status: "Moderate" },
      { name: "Crime Density Index", score: 90, status: "Low Crime Zone" },
      { name: "Time of Day", score: 85, status: "Daylight" },
    ],
    aiSummary: "Location is well lit with nearby police services within 1.5km. Safe for travel.",
  });

  const [geofences, setGeofences] = useState<GeofenceZone[]>([]);
  const [isSosActive, setIsSosActive] = useState(false);
  const [sosStatus, setSosStatus] = useState<any>(null);
  const [isNodeOnline, setIsNodeOnline] = useState(false);
  const [isAiOnline, setIsAiOnline] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    async function checkHealth() {
      const nodeOk = await checkNodeHealth();
      const aiOk = await checkAiHealth();
      setIsNodeOnline(nodeOk);
      setIsAiOnline(aiOk);
    }
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchZones() {
      const zones = await getGeofences();
      if (zones) setGeofences(zones);
    }
    fetchZones();
  }, []);

  useEffect(() => {
    async function updateScore() {
      if (!userLocation) return;
      const data = await getAiSafetyScore(userLocation[0], userLocation[1]);
      if (data) setSafetyScore(data);
      sendGpsSnapshot(userLocation);
    }
    updateScore();
  }, [userLocation]);

  const refreshLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
      },
      (err) => {
        console.warn("Location error:", err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const triggerSos = async (customMsg?: string) => {
    setIsSosActive(true);
    const res = await triggerSosAlert(userLocation, customMsg);
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
  const ctx = useContext(SafetyContext);
  if (!ctx) throw new Error("useSafety must be used within SafetyProvider");
  return ctx;
}
