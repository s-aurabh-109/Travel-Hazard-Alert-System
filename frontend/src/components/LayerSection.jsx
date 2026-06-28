import LayerCard from "./LayerCard";

function LayerSection({
    icon,
    title,
    sectionLayers,
    expanded,
    setExpanded,
    layers,
    setLayers,
    layout = "list",
}) {

    return (
        <div
            style={{
                marginBottom: "0px",
                paddingBottom: "10px", 
            }}
        >
            <div
                onClick={() => setExpanded(!expanded)}
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "15px",
                    marginBottom: "5px",
                    userSelect: "none",
                }}
            >
                <span>
                    {icon} {title}
                </span>

                <span
                    style={{
                        fontSize: "20px",
                    }}
                >
                    {expanded ? "▾" : "▸"}
                </span>
            </div>

            {expanded && (

                layout === "grid" ? (

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "10px",
                            marginTop: "10px",
                        }}
                    >

                        {sectionLayers.map((layer) => (

                            <LayerCard
                                key={layer.key}
                                icon={layer.icon}
                                title={layer.label}
                                active={layers[layer.key]}
                                onClick={() =>
                                    setLayers({
                                        ...layers,
                                        [layer.key]: !layers[layer.key],
                                    })
                                }
                            />

                        ))}

                    </div>

                ) : (

                    <div
                        style={{
                            paddingLeft: "40px",
                        }}
                    >

                        {sectionLayers.map((layer) => (

                            <label
                                key={layer.key}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    marginBottom: "2px",
                                    fontSize: "15px",
                                    cursor: "pointer",
                                }}
                            >

                                <input
                                    type="checkbox"
                                    checked={layers[layer.key]}
                                    onChange={() =>
                                        setLayers({
                                            ...layers,
                                            [layer.key]: !layers[layer.key],
                                        })
                                    }
                                />

                                <span>{layer.label}</span>

                            </label>

                        ))}

                    </div>

                )

            )}
        </div>
    );
}

export default LayerSection;