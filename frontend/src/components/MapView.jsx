import { useState, useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import ChangeView from "./ChangeView";
import TouristMarker from "./TouristMarker";
import EarthquakeLayer from "./EarthquakeLayer";
import LayerControl from "./LayerControl";
import Legend from "./Legend";
import RecenterButton from "./RecenterButton";
import { sendLocation } from "../services/locationService";
import { getNearestHospitals } from "../services/hospitalService";
import { calculateDistance } from "../utils/distance";

const hospitalIcon = L.divIcon({
  className: "hospital-marker",
  html: `
    <div class="hospital-marker__pin">
      <span>+</span>
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -16],
});

function MapView() {
  const [location, setLocation] = useState([20.5937, 78.9629]);

  const [layers, setLayers] = useState({
    earthquake: false,
    flood: false,
    landslide: false,
    drought: false,
    cyclone: false,
    hospital: false,
    police: false,
    shelter: false,
    weather: false,
  });

  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalLayerStatus, setHospitalLayerStatus] = useState("idle");

  const locationRef = useRef(location);
  const lastSentLocationRef = useRef(null);
  const lastHospitalFetchLocationRef = useRef(null);
  const hospitalRequestInFlightRef = useRef(false);

  const loadCurrentLocation = () => {

      navigator.geolocation.getCurrentPosition(

          (position) => {

              setLocation([
                  position.coords.latitude,
                  position.coords.longitude,
              ]);

          },

          (error) => {
              console.error(error);
          },

          {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
          }

      );

  };

  const focusCurrentLocation = () => {
        setRecenterTrigger(prev => prev + 1);
  };

  useEffect(() => {
        if (!navigator.geolocation) return;
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setLocation([
                    position.coords.latitude,
                    position.coords.longitude,
                ]);
            },
            (error) => {
                console.error(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
  }, []);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    const interval = setInterval(async () => {
        const currentLocation = locationRef.current;
        if (!currentLocation) return;
        // First Location
        if (lastSentLocationRef.current === null) {
            await sendLocation({
                tourist_id: "tourist_001",
                latitude: currentLocation[0],
                longitude: currentLocation[1],
                timestamp: Date.now(),
            });
            console.log("First Location Sent");
            lastSentLocationRef.current = currentLocation;
            return;
        }
        const distance = calculateDistance(
            lastSentLocationRef.current,
            currentLocation
        );
        console.log("Distance:", distance);
        if (distance < 10) {
            console.log("Skipped");
            return;
        }
        const response = await sendLocation({
            tourist_id: "tourist_001",
            latitude: currentLocation[0],
            longitude: currentLocation[1],
            timestamp: Date.now(),
        });
        if(response) lastSentLocationRef.current = currentLocation;
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!layers.hospital) {
        setHospitals([]);
        setHospitalLayerStatus("idle");
        lastHospitalFetchLocationRef.current = null;
        return;
    }

    const fetchHospitals = async () => {
        const currentLocation = locationRef.current;
        if (!currentLocation) return;
        if (hospitalRequestInFlightRef.current) return;

        if (lastHospitalFetchLocationRef.current !== null) {
            const distance = calculateDistance(
                lastHospitalFetchLocationRef.current,
                currentLocation
            );

            if (distance < 1000) return;
        }

        setHospitalLayerStatus("loading");
        hospitalRequestInFlightRef.current = true;

        const response = await getNearestHospitals({
            latitude: currentLocation[0],
            longitude: currentLocation[1],
            limit: 10,
            radiusMeters: 10000,
        });

        console.log("Hospital API response:", response);
        const nextHospitals = response?.hospitals ?? [];

        setHospitals(nextHospitals);
        setHospitalLayerStatus(nextHospitals.length > 0 ? "loaded" : "empty");
        lastHospitalFetchLocationRef.current = currentLocation;
        hospitalRequestInFlightRef.current = false;
    };

    fetchHospitals().catch((error) => {
        console.error("Hospital layer error:", error);
        hospitalRequestInFlightRef.current = false;
        setHospitalLayerStatus("error");
    });
  }, [layers.hospital, location]);

  return (
    <div
        style={{
            position: "relative",
            height: "100vh",
            width: "100%",
        }}
    >

        <LayerControl
            layers={layers}
            setLayers={setLayers}
            isOpen={layerPanelOpen}
            setIsOpen={setLayerPanelOpen}
        />

        {!layerPanelOpen && (
            <RecenterButton
                onClick={focusCurrentLocation}
            />
        )}

        {layers.earthquake && <Legend />}
        {layers.hospital && hospitalLayerStatus !== "loaded" && (
            <div
                style={{
                    position: "absolute",
                    left: "14px",
                    bottom: "28px",
                    zIndex: 1000,
                    background: "#fff",
                    color: "#333",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    boxShadow: "0 3px 12px rgba(0,0,0,0.16)",
                    padding: "8px 12px",
                    fontSize: "13px",
                    fontWeight: 600,
                }}
            >
                {hospitalLayerStatus === "loading" && "Finding nearby hospitals..."}
                {hospitalLayerStatus === "empty" && "No hospitals found nearby"}
                {hospitalLayerStatus === "error" && "Could not load hospitals"}
            </div>
        )}
        <MapContainer
          center={location}
          zoom={5}
          style={{ height: "100vh", width: "100%" }}
        >
          {
            <ChangeView
              center = {location}
              zoom = {15}
              trigger={recenterTrigger}
            />
          }

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {layers.earthquake && <EarthquakeLayer />}
          <TouristMarker
            position={location}
          />
          {layers.hospital && hospitals.map((hospital) => (
            <Marker
              key={hospital.id}
              position={[hospital.latitude, hospital.longitude]}
              icon={hospitalIcon}
            >
              <Popup>
                <strong>{hospital.name}</strong>
                <br />
                {hospital.distance_km} km away
                <br />
                {hospital.address}
                {hospital.emergency_phone && (
                  <>
                    <br />
                    Phone: {hospital.emergency_phone}
                  </>
                )}
              </Popup>
            </Marker>
          ))}
          
        </MapContainer>
    </div>
  );
}

export default MapView;

/* http://localhost:5173*/
