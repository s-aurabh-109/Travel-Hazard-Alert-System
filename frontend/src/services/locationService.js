const API_URL = "http://127.0.0.1:8000";;

export async function sendLocation(location) {
    try {
        const response = await fetch(`${API_URL}/location/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(location),
        });

        if (!response.ok) {
            throw new Error("Failed to send location");
        }
        return await response.json();

    } catch (error) {
        console.error("Location API Error:", error);
    }
}