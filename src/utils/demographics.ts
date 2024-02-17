import { fromAddress } from "react-geocode";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Viewport {
  low: Coordinates;
  high: Coordinates;
}

function extractCity(address: string): string | null {
  const parts = address.split(",");
  let city: string | null = null;
  let zipCodeIndex: number | null = null;

  console.log(address);
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i].trim();
    if (part.includes("City of ")) {
      city = part.slice("City of ".length).trim();
      break;
    }
    if (part.match(/^\d{5}$/) && i > 1) {
      zipCodeIndex = i;
    }
  }

  if (!city && zipCodeIndex) {
    // If none of the recognizable keywords are found,
    // assume city is 3 parts before the zip code
    city = parts[zipCodeIndex - 3]?.trim() || null;

    if (city?.includes("County")) {
      return null;
    }

    if (city && /\d/.test(city)) {
      // Corrected line: Fails if there are any numbers in `city`
      return null;
    }
  }

  return city;
}

async function getCityCenterCoordinates(
  cityName: string
): Promise<Coordinates> {
  try {
    const response = await fromAddress(cityName);
    const { lat, lng } = response.results[0].geometry.location;
    console.log(lat, lng);
    return { latitude: lat, longitude: lng };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get city center coordinates.");
  }
}

function metersToDegreesLatitude(meters: number): number {
  /** Convert miles to degrees latitude. */
  return meters / 111139.0;
}

function metersToDegreesLongitude(meters: number, latitude: number): number {
  /** Convert miles to degrees longitude at a given latitude. */
  // Earth's radius in meters
  const earthRadius = 6378137.0;
  const radiansLatitude = (latitude * Math.PI) / 180; // Convert degrees to radians
  // Calculate the radius of a circle at the given latitude
  const metersPerDegree =
    (Math.cos(radiansLatitude) * Math.PI * earthRadius) / 180.0;
  return meters / metersPerDegree;
}

function metersToDegrees(meters: number, centerLat: number): [number, number] {
  /**
   * Given a distance in meters and a center latitude, calculate the number of degrees
   * in latitude and longitude that correspond to the radius.
   */
  const latAdjustment = metersToDegreesLatitude(meters);
  const lonAdjustment = metersToDegreesLongitude(meters, centerLat);
  return [latAdjustment, lonAdjustment];
}

function getViewport(
  centerLat: number,
  centerLon: number,
  radiusMeters: number
): Viewport {
  /**
   * Given a center (lat, lon) and radius in meters, calculate a viewport.
   * Where the low is the bottom left corner and the high is the top right corner.
   */
  const [latAdjustment, lonAdjustment] = metersToDegrees(
    radiusMeters,
    centerLat
  );

  const lowLat = Math.max(-90, centerLat - latAdjustment);
  const highLat = Math.min(90, centerLat + latAdjustment);
  let lowLon = centerLon - lonAdjustment;
  let highLon = centerLon + lonAdjustment;

  // Handle longitude wraparound
  if (lowLon < -180) {
    lowLon += 360;
  }
  if (highLon > 180) {
    highLon -= 360;
  }

  return {
    low: { latitude: lowLat, longitude: lowLon },
    high: { latitude: highLat, longitude: highLon },
  };
}

function getGridCoordinates(
  centerLat: number,
  centerLon: number,
  radiusMeters: number,
  gridSideMeters: number
): [number, number][] {
  /**
   * Given a center (lat, lon), radius in meters, and grid square area in meters,
   * calculate a grid of coordinates.
   */

  const [gridLatAdjustment, gridLonAdjustment] = metersToDegrees(
    gridSideMeters,
    centerLat
  );
  const [latAdjustment, lonAdjustment] = metersToDegrees(
    radiusMeters,
    centerLat
  );

  const lonSteps = Math.floor(lonAdjustment / gridLonAdjustment) * 2;
  const latSteps = Math.floor(latAdjustment / gridLatAdjustment) * 2;

  const latStepSize = gridLatAdjustment;
  const lonStepSize = gridLonAdjustment;

  const grid: [number, number][] = [];

  // Subtract 1 from latSteps and lonSteps to avoid going over the radius
  // since we are adding half the step size to the center
  for (let i = 0; i < latSteps - 1; i++) {
    for (let j = 0; j < lonSteps - 1; j++) {
      const lat = centerLat - latAdjustment + latStepSize / 2 + i * latStepSize;
      const lon = centerLon - lonAdjustment + lonStepSize / 2 + j * lonStepSize;
      grid.push([lat, lon]);
    }
  }

  return grid;
}

export {
  extractCity,
  getCityCenterCoordinates,
  getViewport,
  getGridCoordinates,
};

export type { Coordinates, Viewport };
