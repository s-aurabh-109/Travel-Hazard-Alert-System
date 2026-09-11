function Legend() {

    const rowStyle = {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "0px",
        fontSize: "13px",
        color: "#444",
        fontWeight: "600",
    };

    const boxStyle = (color) => ({
        width: "10px",
        height: "10px",
        backgroundColor: color,
        border: "1px solid rgba(0,0,0,0.2)",
        borderRadius: "3px",
        flexShrink: 0,
    });

    return (

        <div
            style={{
                position: "absolute",
                bottom: "20px",
                left: "15px",
                zIndex: 1000,
                background: "#ffffff",
                padding: "5px 10px",
                borderRadius: "15px",
                boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
                minWidth: "140px",
            }}
        >

            <h4
                style={{
                    margin: "0 0 8px 0",
                    textAlign: "center",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#333",
                }}
            >
                Earthquake Zones
            </h4>

            <div style={rowStyle}>
                <div style={boxStyle("#4CAF50")} />
                <span>Zone II</span>
            </div>

            <div style={rowStyle}>
                <div style={boxStyle("#FDD835")} />
                <span>Zone III</span>
            </div>

            <div style={rowStyle}>
                <div style={boxStyle("#FB8C00")} />
                <span>Zone IV</span>
            </div>

            <div style={rowStyle}>
                <div style={boxStyle("#E53935")} />
                <span>Zone V</span>
            </div>

        </div>

    );

}

export default Legend;