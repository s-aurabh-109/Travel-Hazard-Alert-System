const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getNearestHospitals({
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

        const url = `${API_URL}/hospitals/nearest?${params}`;
        console.log("Calling hospital API:", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to fetch nearest hospitals");
        }

        return await response.json();

    } catch (error) {
        console.error("Hospital API Error:", error);
    }
}

export async function getNearestHospitalsFromRedis({
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
            `${API_URL}/hospitals/nearest/from-redis/${touristId}?${params}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch nearest hospitals from Redis");
        }

        return await response.json();

    } catch (error) {
        console.error("Hospital Redis API Error:", error);
    }
}
