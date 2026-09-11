import { useEffect, useState } from "react";
import HazardLayer from "./HazardLayer";

function EarthquakeLayer() {

    const [zones, setZones] = useState({
        zone2: null,
        zone3: null,
        zone4: null,
        zone5: null,
    });

    useEffect(() => {

        Promise.all([

            fetch("/geojson/zone2.geojson").then(res => res.json()),
            fetch("/geojson/zone3.geojson").then(res => res.json()),
            fetch("/geojson/zone4.geojson").then(res => res.json()),
            fetch("/geojson/zone5.geojson").then(res => res.json()),

        ])
        .then(([zone2, zone3, zone4, zone5]) => {

            setZones({
                zone2,
                zone3,
                zone4,
                zone5
            });

        })
        .catch(console.error);

    }, []);

    return (
        <>
            <HazardLayer
                data={zones.zone2}
                zoneName="Earthquake Zone II"
                riskLevel="Low"
                intensity="Low Intensity Zone"
                fillColor="#4CAF50"
                borderColor="#2E7D32"
            />

            <HazardLayer
                data={zones.zone3}
                zoneName="Earthquake Zone III"
                riskLevel="Moderate"
                intensity="Moderate Intensity Zone"
                fillColor="#FDD835"
                borderColor="#F9A825"
            />

            <HazardLayer
                data={zones.zone4}
                zoneName="Earthquake Zone IV"
                riskLevel="High"
                intensity="High Intensity Zone"
                fillColor="#FB8C00"
                borderColor="#E65100"
            />

            <HazardLayer
                data={zones.zone5}
                zoneName="Earthquake Zone V"
                riskLevel="Very High"
                intensity="Very High Intensity Zone"
                fillColor="#E53935"
                borderColor="#B71C1C"
            />
        </>
    );

}

export default EarthquakeLayer;