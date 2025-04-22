export type Geoposition = {
  latitude: number;
  longitude: number;
};

// Calculates the distance between two geoposition points using the Haversine formula.
// The Haversine formula is used to calculate the distance between two points on the surface of a sphere.
// The function takes two Geoposition objects as arguments and returns the distance in metres.
export const getDistance = (from: Geoposition, to: Geoposition): number => {
  const R = 6371e3; // metres
  // φ, λ in radians
  const φ1 = (from.latitude * Math.PI) / 180;
  const φ2 = (to.latitude * Math.PI) / 180;
  const Δφ = ((to.latitude - from.latitude) * Math.PI) / 180;
  const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres

  return d;
};
