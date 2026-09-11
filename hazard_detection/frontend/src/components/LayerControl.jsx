import { useState } from "react";
import LayerSection from "./LayerSection";
import layersIcon from "../assets/layers.png";

function LayerControl({ layers, setLayers, isOpen, setIsOpen }) {

    const [showHazards, setShowHazards] = useState(false);

    const [showServices, setShowServices] = useState(false);

    const [showLiveData, setShowLiveData] = useState(false);

    const hazardLayers = [
        { key: "earthquake", label: "Earthquake", icon: "🌍",},
        { key: "flood", label: "Flood", icon: "🌊",},
        { key: "landslide", label: "Landslide", icon: "⛰️", },
        { key: "drought", label: "Drought" , icon: "☀️",},
        { key: "cyclone", label: "Cyclone", icon: "🌪️", },
    ];

    const serviceLayers = [
        { key: "hospital", label: "Hospitals", icon: "🏥" },
        { key: "police", label: "Police", icon: "👮" },
        { key: "shelter", label: "Shelters", icon: "🏠" },
    ];

    const liveLayers = [
        { key: "weather", label: "Weather", icon: "🌤️" },
    ];

    return (

        <div
            style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 1000,
            }}
        >

            {/* Floating Button */}

            <button

                onClick={() => setIsOpen(!isOpen)}

                style={{

                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    border: "1px solid #e5e5e5",
                    cursor: "pointer",
                    background: "#fff",
                    boxShadow: "0 3px 12px rgba(0,0,0,0.15)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    transition: "all 0.2s ease"
                }}

            >
              <img
                  src={layersIcon}
                  alt="Layers"
                  style={{
                      width: "28px",
                      height: "28px",
                      objectFit: "contain",
                  }}
              />
            </button>

            {/* Popup */}
            {isOpen && (

                <div
                    style={{
                        position: "absolute",
                        top: "45px",
                        right: "0",
                        width: "300px",
                        background: "#fff",
                        borderRadius: "10px",
                        boxShadow: "0 4px 15px rgba(0,0,0,.25)",
                        overflowX: "hidden",
                        overflowY: "auto",
                    }}
                >

                    {/* Header */}

                    <div
                        style={{
                            position: "sticky",
                            top: 0,
                            background: "white",
                            padding: "5px",
                            borderBottom: "1px solid #e5e5e5",
                            zIndex: 5,
                        }}
                    >

                        <h2
                            style={{
                                margin: 0,
                            }}
                        >
                            Layers
                        </h2>

                    </div>

                    {/* Scrollable Content */}

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            maxHeight: "calc(100vh - 180px)",
                            overflowY: "auto",
                            paddingLeft: "18px",
                            paddingRight: "18px",
                            paddingTop: "15px",
                            paddingBottom: "5px",
                        }}
                    >

                        <LayerSection
                            icon="🌎"
                            title="Hazards"
                            sectionLayers={hazardLayers}
                            expanded={showHazards}
                            setExpanded={setShowHazards}
                            layers={layers}
                            setLayers={setLayers}
                            layout="grid"
                        />

                        <LayerSection
                            icon="🏥"
                            title="Services"
                            sectionLayers={serviceLayers}
                            expanded={showServices}
                            setExpanded={setShowServices}
                            layers={layers}
                            setLayers={setLayers}
                            layout="grid"
                        />

                        <LayerSection
                            icon="🌤"
                            title="Live Data"
                            sectionLayers={liveLayers}
                            expanded={showLiveData}
                            setExpanded={setShowLiveData}
                            layers={layers}
                            setLayers={setLayers}
                            layout="grid"
                        />

                    </div>

                </div>

            )}

        </div>
    );
}

export default LayerControl;