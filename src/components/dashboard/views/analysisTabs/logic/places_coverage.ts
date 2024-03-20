import { Coordinates, Grid, getGridCoordinates } from "utils/demographics";
import { METERS_PER_KILOMETER, METERS_PER_MILE } from "./constants";
import GooglePlacesAPI from "utils/google_places";

const DefaultPrompts = [
  "All restaurants", // This first one in the list is the default used for optimization purposes
  "All bakeries",
  "All cafes",
  "All coffee shops",
];

interface CostResults {
  numberOfSquares: number;
  totalCost: number;
  searchBlockArea: number;
  totalAreaMeters: number;
  searchRadiusMiles: number;
}

function calculateCostFromResults(
  searchBlockWidth: number,
  costPerSquare: number,
  radiusMeters: number,
  printResults: boolean = true
): CostResults {
  // Area of one square in square meters
  const searchBlockArea: number = searchBlockWidth * searchBlockWidth;

  const areaWidth: number = radiusMeters * 2;

  const totalAreaMeters: number = areaWidth * areaWidth;

  if (searchBlockArea <= 0 || totalAreaMeters <= 0) {
    throw new Error("Invalid search block area or total area");
  }

  // Calculate how many X meter squares fit into the area
  const numberOfSquares: number = totalAreaMeters / searchBlockArea;

  const totalCost: number = numberOfSquares * costPerSquare;

  if (printResults) {
    console.log(`Total searches: ${numberOfSquares.toFixed(0)}`);
    console.log(`Total cost: $${totalCost.toFixed(2)}`);
    console.log(`Searched area: ${searchBlockArea.toFixed(2)} m^2`);
    console.log(`Total area: ${totalAreaMeters.toFixed(2)} m^2`);
  }

  return {
    numberOfSquares,
    totalCost,
    searchBlockArea,
    totalAreaMeters,
    searchRadiusMiles: radiusMeters / METERS_PER_MILE,
  };
}

interface GridSearchResults {
  radiusMiles: number;
  grid: Grid;
  numberOfSquares: number;
  totalCost: number;
  gridWidthMeters: number;
  cityCenter: Coordinates;
}

const findMaxGridSearchResultsWithinBudget = async (
  centerLat: number,
  centerLon: number,
  initialRadiusMeters: number,
  costPerSearch: number,
  searchBudget: number
): Promise<GridSearchResults> => {
  let radiusMeters = initialRadiusMeters;
  let totalCost = searchBudget + 1;
  let grid: Grid = [];
  let numberOfSquares = 0;

  const googlePlacesApi: GooglePlacesAPI = new GooglePlacesAPI(
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    false
  );

  const maxGridResolutionWidthMeters =
    await googlePlacesApi.findMaximumViewpointWidth(
      centerLat,
      centerLon,
      DefaultPrompts[0]
    );

  console.log(`Max viewpoint width: ${maxGridResolutionWidthMeters}m`);

  if (maxGridResolutionWidthMeters <= 0) {
    console.error("Error: Unable to find maximum viewpoint width");
    return {
      radiusMiles: 0,
      grid: [],
      numberOfSquares: 0,
      totalCost: 0,
      gridWidthMeters: 0,
      cityCenter: { latitude: 0, longitude: 0 },
    };
  }

  while (totalCost > searchBudget && radiusMeters > METERS_PER_KILOMETER) {
    ({ numberOfSquares, totalCost } = calculateCostFromResults(
      maxGridResolutionWidthMeters,
      costPerSearch * DefaultPrompts.length,
      radiusMeters,
      false
    ));
    radiusMeters -= METERS_PER_KILOMETER;
  }
  grid = getGridCoordinates(
    centerLat,
    centerLon,
    radiusMeters,
    maxGridResolutionWidthMeters,
    true
  );
  const radiusMiles = radiusMeters / METERS_PER_MILE;

  console.log(`Final radius: ${radiusMiles.toFixed(2)} miles`);
  console.log(`Final cost: $${totalCost}`);
  return {
    radiusMiles,
    grid,
    numberOfSquares,
    totalCost,
    gridWidthMeters: maxGridResolutionWidthMeters,
    cityCenter: { latitude: centerLat, longitude: centerLon },
  };
};

export { calculateCostFromResults, findMaxGridSearchResultsWithinBudget };
export type { CostResults, GridSearchResults };
