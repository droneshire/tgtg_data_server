import { GridSearchResults } from "components/dashboard/views/analysisTabs/logic/places_coverage";
import { Grid } from "utils/demographics";
import { GooglePlacesAPIResponse } from "utils/google_places";

export interface DemographicAndPlacesData {
    [key: string]: {
        censusData: any;
        placesData: GooglePlacesAPIResponse;
    }
}

const runCityGridSearch = (
  cityName: string,
  grid: Grid
): Promise<CsvDataRow[]> => {
  return new Promise((resolve, reject) => {
    console.log(`Running search on ${cityName}...`);
    console.log(`Searching ${grid.length} grid points...`);
  });
};

addEventListener("message", async (e: MessageEvent) => {
  const gridSearchResults = e.data as GridSearchResults;
  try {
    const searchResults = await runCityGridSearch(GridSearchResults);
    postMessage(searchResults);
  } catch (error) {
    console.error(error);
    postMessage(new Map());
  }
});
