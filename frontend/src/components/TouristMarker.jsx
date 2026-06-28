import { Marker, Popup } from "react-leaflet";

function TouristMarker({ position }) {

    return (
        <Marker position={position}>
            <Popup>
                📍 You are here!
            </Popup>
        </Marker>
    );

}

export default TouristMarker;