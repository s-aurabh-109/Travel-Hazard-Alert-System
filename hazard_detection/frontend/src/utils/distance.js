// Radius of Earth in meters
const EARTH_RADIUS = 6371000;

// Convert Degrees → Radians
function toRadians(degree) {
    return degree * (Math.PI / 180);
}

export function calculateDistance(pointA, pointB) {

    const [lat1, lon1] = pointA;
    const [lat2, lon2] = pointB;

    // Convert degrees to radians
    const phi1 = toRadians(lat1);
    const phi2 = toRadians(lat2);

    // Differences
    const deltaPhi = toRadians(lat2 - lat1);
    const deltaLambda = toRadians(lon2 - lon1);

    // Haversine Formula
    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return EARTH_RADIUS * c;
}