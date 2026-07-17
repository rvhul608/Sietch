// utils/distance.ts

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface HospitalLocation {
    id: string;
    name: string;
    coords: [number, number]; // [latitude, longitude]
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * Calculate distance between two coordinates using Haversine Formula.
 * Returns distance in kilometers.
 */
export function calculateDistance(
    from: Coordinates,
    to: Coordinates
): number {
    const EARTH_RADIUS = 6371; // km

    const dLat = toRadians(to.lat - from.lat);
    const dLng = toRadians(to.lng - from.lng);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(from.lat)) *
        Math.cos(toRadians(to.lat)) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Number((EARTH_RADIUS * c).toFixed(2));
}

/**
 * Returns the nearest hospital from a list.
 */
export function findNearestHospital(
    userLocation: Coordinates,
    hospitals: HospitalLocation[]
) {
    if (!hospitals.length) return null;

    return hospitals
        .map((hospital) => ({
            ...hospital,
            distance: calculateDistance(userLocation, {
                lat: hospital.coords[0],
                lng: hospital.coords[1],
            }),
        }))
        .sort((a, b) => a.distance - b.distance)[0];
}

/**
 * Returns all hospitals within a given radius (km),
 * sorted by nearest first.
 */
export function hospitalsWithinRadius(
    userLocation: Coordinates,
    hospitals: HospitalLocation[],
    radiusKm: number
) {
    return hospitals
        .map((hospital) => ({
            ...hospital,
            distance: calculateDistance(userLocation, {
                lat: hospital.coords[0],
                lng: hospital.coords[1],
            }),
        }))
        .filter((hospital) => hospital.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);
}