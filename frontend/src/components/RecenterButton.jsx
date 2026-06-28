function RecenterButton({ onClick }) {

    return (

        <button
            onClick={onClick}
            style={{
                position: "absolute",
                top: "60px",
                right: "10px",
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
                zIndex: 1000,
                boxShadow: "0 3px 12px rgba(0,0,0,.15)"
            }}
        >
            📍
        </button>

    );

}

export default RecenterButton;