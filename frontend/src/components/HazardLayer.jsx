import { GeoJSON } from "react-leaflet";

function HazardLayer({
    data,
    zoneName,
    riskLevel,
    intensity,
    fillColor,
    borderColor
}) {

    if (!data)
        return null;

    return (
        <GeoJSON
            data={data}

            style={() => ({
                color: borderColor,
                fillColor: fillColor,
                weight: 2,
                fillOpacity: 0.55,
            })}

            onEachFeature={(feature, layer) => {

                layer.bindPopup(`
                    <h4>${zoneName}</h4>
                    <b>Risk Level :</b> ${riskLevel}<br>
                    <b>Intensity :</b> ${intensity}
                `);

            }}
        />
    );

}

export default HazardLayer;