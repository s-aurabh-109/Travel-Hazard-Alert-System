import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";


function ChangeView({ center, zoom, trigger }) {

    const map = useMap();

    useEffect(() => {

        if (trigger === 0) return;

        const currentCenter = map.getCenter();
        const currentZoom = map.getZoom();

        const target = L.latLng(center[0], center[1]);

        // Distance in meters between current center and target
        const distance = currentCenter.distanceTo(target);

        // Already centered (within 5 meters)
        const alreadyCentered = distance < 5;

        const alreadyZoomed = currentZoom === zoom;

        if (alreadyCentered && alreadyZoomed) {
            return;
        }

        map.flyTo(target, zoom, {
            duration: 1,
        });

    }, [trigger, center, zoom, map]);

    return null;
}

export default ChangeView;