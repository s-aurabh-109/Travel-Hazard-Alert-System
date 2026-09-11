const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getNearestPoliceStations({
    latitude,
    longitude,
    limit = 10,
    radiusMeters = 10000,
}) {
    try {
        const params = new URLSearchParams({
            latitude,
            longitude,
            limit,
            radius_meters: radiusMeters,
        });

        const url = `${API_URL}/police/nearest?${params}`;
        console.log("Calling police API:", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to fetch nearest police stations");
        }

        return await response.json();

    } catch (error) {
        console.error("Police API Error:", error);
    }
}

export async function getNearestPoliceStationsFromRedis({
    touristId,
    limit = 10,
    radiusMeters = 10000,
}) {
    try {
        const params = new URLSearchParams({
            limit,
            radius_meters: radiusMeters,
        });

        const response = await fetch(
            `${API_URL}/police/nearest/from-redis/${touristId}?${params}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch nearest police stations from Redis");
        }

        return await response.json();

    } catch (error) {
        console.error("Police Redis API Error:", error);
    }
}
