import { useState } from "react";


function LayerCard({ icon, title, active, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                cursor: "pointer",
                width: "78px",
                height: "100px",
                borderRadius: "12px",
                overflow: "hidden",
                background: "#ffffff",
                border: "1px solid #ddd",

                boxShadow: active
                    ? "0 0 0 2px #1976D2, 0 6px 14px rgba(25,118,210,0.28)"
                    : hovered
                        ? "0 0 0 2px rgba(25,118,210,0.35), 0 4px 10px rgba(25,118,210,0.18)"
                        : "0 2px 6px rgba(0,0,0,0.08)",

                transform: hovered ? "translateY(-2px)" : "translateY(0)",

                transition: "all 0.18s ease",
                position: "relative",
            }}
        >
            {active && (
                <div
                    style={{
                        position: "absolute",
                        top: "5px",
                        right: "6px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "#1976D2",
                        color: "white",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "11px",
                        fontWeight: "bold",
                        zIndex: 2,
                    }}
                >
                    ✓
                </div>
            )}

            <div
                style={{
                    height: "64px",
                    background: active ? "#E8F1FF" 
                                       : hovered
                                            ? "#F2F8FF"
                                            : "#F8F9FA",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div style={{ fontSize: "28px" }}>{icon}</div>
            </div>

            <div
                style={{
                    height: "36px",
                    borderTop: "1px solid #eee",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "0 4px",
                    textAlign: "center",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#444",
                    lineHeight: "1.1",
                }}
            >
                {title}
            </div>
        </div>
    );
}

export default LayerCard;