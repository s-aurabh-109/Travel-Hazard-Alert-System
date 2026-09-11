import { useState, useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSafety } from "../../context/SafetyContext";
import { getNearestHospitals } from "../../services/hospitalService";
import { getNearestPoliceStations } from "../../services/policeService";

const hospitalIcon = L.divIcon({
  className: "hospital-marker",
  html: `<div style="width:26px;height:26px;border-radius:50%;background:#ef4444;border:2px solid #fff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;box-shadow:0 3px 8px rgba(0,0,0,0.3)">+</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const policeIcon = L.divIcon({
  className: "police-marker",
  html: `<div style="width:26px;height:26px;border-radius:50%;background:#3b82f6;border:2px solid #fff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;box-shadow:0 3px 8px rgba(0,0,0,0.3)">★</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const touristIcon = L.divIcon({
  className: "tourist-marker",
  html: `<div style="position:relative;width:24px;height:24px;">
    <div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(99,102,241,0.35);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
    <div style="width:24px;height:24px;border-radius:50%;background:#6366f1;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.4);"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

export default function LeafletMap({ showHospitals = true, showPolice = true }: { showHospitals?: boolean; showPolice?: boolean }) {
  const { userLocation, geofences } = useSafety();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [policeStations, setPoliceStations] = useState<any[]>([]);

  useEffect(() => {
    async function loadServices() {
      try {
        if (showHospitals) {
          const hList = await getNearestHospitals(userLocation);
          setHospitals(hList || []);
        }
        if (showPolice) {
          const pList = await getNearestPoliceStations(userLocation);
          setPoliceStations(pList || []);
        }
      } catch (e) {
        console.warn("Failed to fetch nearby services", e);
      }
    }
    loadServices();
  }, [userLocation, showHospitals, showPolice]);

  return (
    <MapContainer
      center={userLocation}
      zoom={14}
      scrollWheelZoom={true}
      zoomControl={false}
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ChangeView center={userLocation} />

      {/* User Location Pulse Marker */}
      <Marker position={userLocation} icon={touristIcon}>
        <Popup>
          <strong>📍 Your Live Safety Location</strong>
          <br />
          Coordinates: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
        </Popup>
      </Marker>

      {/* Dynamic Backend Geofence Danger/Safe Circles */}
      {geofences.map((gf) => (
        <Circle
          key={gf.id}
          center={gf.coordinates}
          radius={gf.radius || 1500}
          pathOptions={{
            color: gf.type === "danger" ? "#ef4444" : "#10b981",
            fillColor: gf.type === "danger" ? "#ef4444" : "#10b981",
            fillOpacity: 0.18,
            weight: 2,
            dashArray: gf.type === "danger" ? "6, 6" : undefined,
          }}
        >
          <Popup>
            <strong>{gf.name}</strong>
            <br />
            Status: {gf.type === "danger" ? "🚨 HIGH DANGER ZONE" : "🛡️ PROTECTED SAFE ZONE"}
          </Popup>
        </Circle>
      ))}

      {/* Hospitals */}
      {showHospitals &&
        hospitals.map((h, i) => (
          <Marker key={`h-${i}`} position={[h.lat, h.lon]} icon={hospitalIcon}>
            <Popup>
              <strong>🏥 {h.name}</strong>
              <br />
              Distance: {h.distance || "Nearby Emergency"}
            </Popup>
          </Marker>
        ))}

      {/* Police */}
      {showPolice &&
        policeStations.map((p, i) => (
          <Marker key={`p-${i}`} position={[p.lat, p.lon]} icon={policeIcon}>
            <Popup>
              <strong>👮 {p.name}</strong>
              <br />
              Distance: {p.distance || "Police Patrol"}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
