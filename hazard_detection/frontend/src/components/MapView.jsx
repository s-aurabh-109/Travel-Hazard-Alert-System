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
import { getNearestPoliceStations } from "../services/policeService";
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

const policeIcon = L.divIcon({
  className: "police-marker",
  html: `
    <div class="police-marker__pin">
      <span>★</span>
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -16],
});

const SERVICE_SEARCH_RADIUS_METERS = 10000;
const SERVICE_RESULT_LIMIT = 10;
const SERVICE_REFETCH_DISTANCE_METERS = 1000;

function buildNearbyRequestKey(location, radiusMeters, limit) {
  return [
    location[0].toFixed(2),
    location[1].toFixed(2),
    radiusMeters,
    limit,
  ].join(":");
}

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
  const [policeStations, setPoliceStations] = useState([]);
  const [policeLayerStatus, setPoliceLayerStatus] = useState("idle");

  const locationRef = useRef(location);
  const lastSentLocationRef = useRef(null);
  const lastHospitalFetchLocationRef = useRef(null);
  const hospitalRequestInFlightRef = useRef(false);
  const lastHospitalRequestKeyRef = useRef(null);
  const lastPoliceFetchLocationRef = useRef(null);
  const policeRequestInFlightRef = useRef(false);
  const lastPoliceRequestKeyRef = useRef(null);

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
        lastHospitalRequestKeyRef.current = null;
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

            if (distance < SERVICE_REFETCH_DISTANCE_METERS) return;
        }

        const requestKey = buildNearbyRequestKey(
            currentLocation,
            SERVICE_SEARCH_RADIUS_METERS,
            SERVICE_RESULT_LIMIT,
        );

        if (lastHospitalRequestKeyRef.current === requestKey) return;

        setHospitalLayerStatus("loading");
        hospitalRequestInFlightRef.current = true;
        lastHospitalRequestKeyRef.current = requestKey;

        const response = await getNearestHospitals({
            latitude: currentLocation[0],
            longitude: currentLocation[1],
            limit: SERVICE_RESULT_LIMIT,
            radiusMeters: SERVICE_SEARCH_RADIUS_METERS,
        });

        if (!response) {
            setHospitalLayerStatus("error");
            hospitalRequestInFlightRef.current = false;
            lastHospitalRequestKeyRef.current = null;
            return;
        }

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
        lastHospitalRequestKeyRef.current = null;
        setHospitalLayerStatus("error");
    });
  }, [layers.hospital, location]);

  useEffect(() => {
    if (!layers.police) {
        setPoliceStations([]);
        setPoliceLayerStatus("idle");
        lastPoliceFetchLocationRef.current = null;
        lastPoliceRequestKeyRef.current = null;
        return;
    }

    const fetchPoliceStations = async () => {
        const currentLocation = locationRef.current;
        if (!currentLocation) return;
        if (policeRequestInFlightRef.current) return;

        if (lastPoliceFetchLocationRef.current !== null) {
            const distance = calculateDistance(
                lastPoliceFetchLocationRef.current,
                currentLocation
            );

            if (distance < SERVICE_REFETCH_DISTANCE_METERS) return;
        }

        const requestKey = buildNearbyRequestKey(
            currentLocation,
            SERVICE_SEARCH_RADIUS_METERS,
            SERVICE_RESULT_LIMIT,
        );

        if (lastPoliceRequestKeyRef.current === requestKey) return;

        setPoliceLayerStatus("loading");
        policeRequestInFlightRef.current = true;
        lastPoliceRequestKeyRef.current = requestKey;

        const response = await getNearestPoliceStations({
            latitude: currentLocation[0],
            longitude: currentLocation[1],
            limit: SERVICE_RESULT_LIMIT,
            radiusMeters: SERVICE_SEARCH_RADIUS_METERS,
        });

        if (!response) {
            setPoliceLayerStatus("error");
            policeRequestInFlightRef.current = false;
            return;
        }

        console.log("Police API response:", response);
        const nextPoliceStations = response?.police_stations ?? [];

        setPoliceStations(nextPoliceStations);
        setPoliceLayerStatus(
            response.provider_status === "unavailable"
                ? "unavailable"
                : nextPoliceStations.length > 0
                    ? "loaded"
                    : "empty"
        );
        lastPoliceFetchLocationRef.current = currentLocation;
        policeRequestInFlightRef.current = false;
    };

    fetchPoliceStations().catch((error) => {
        console.error("Police layer error:", error);
        policeRequestInFlightRef.current = false;
        setPoliceLayerStatus("error");
    });
  }, [layers.police, location]);

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
        {layers.police && policeLayerStatus !== "loaded" && (
            <div
                style={{
                    position: "absolute",
                    left: "14px",
                    bottom: layers.hospital && hospitalLayerStatus !== "loaded"
                        ? "78px"
                        : "28px",
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
                {policeLayerStatus === "loading" && "Finding nearby police stations..."}
                {policeLayerStatus === "empty" && "No police stations found nearby"}
                {policeLayerStatus === "unavailable" && "Police data provider is slow right now"}
                {policeLayerStatus === "error" && "Could not load police stations"}
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
          {layers.police && policeStations.map((policeStation) => (
            <Marker
              key={policeStation.id}
              position={[policeStation.latitude, policeStation.longitude]}
              icon={policeIcon}
            >
              <Popup>
                <strong>{policeStation.name}</strong>
                <br />
                {policeStation.distance_km} km away
                <br />
                {policeStation.address}
                {policeStation.phone && (
                  <>
                    <br />
                    Phone: {policeStation.phone}
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
