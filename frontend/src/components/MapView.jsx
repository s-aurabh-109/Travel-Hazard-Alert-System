import { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import ChangeView from "./ChangeView";
import TouristMarker from "./TouristMarker";
import EarthquakeLayer from "./EarthquakeLayer";
import LayerControl from "./LayerControl";
import Legend from "./Legend";
import RecenterButton from "./RecenterButton";


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
          
        </MapContainer>
    </div>
  );
}

export default MapView;