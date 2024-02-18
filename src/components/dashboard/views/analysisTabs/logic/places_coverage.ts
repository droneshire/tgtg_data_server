interface CostResults {
  numberOfSquares: number;
  totalCost: number;
  searchBlockArea: number;
  totalAreaMeters: number;
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
  };
}

export { calculateCostFromResults };
export type { CostResults };
