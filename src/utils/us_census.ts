import census from "citysdk";
import { getAddressCoordinates } from "./demographics";

class USCensusAPI {
  private apiKey: string;
  private cache: Map<string, any>;
  private defaultDataset: string = "ACS5";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.cache = new Map<string, any>();
  }

  private async getCensusFields(
    year: number,
    dataset: string
  ): Promise<Map<string, any>> {
    // Assuming this method is intended to cache field descriptions
    if (this.cache.size > 0) {
      return this.cache;
    }

    const definitionsUrl = `https://api.census.gov/data/${year.toString()}/${dataset}/variables.json`;

    try {
      const response = await fetch(definitionsUrl);
      const obj = await response.json();

      for (const [key, elem] of Object.entries(obj["variables"])) {
        if (key === "for" || key === "in") {
          continue;
        }

        const dict = elem as any;

        if ("concept" in dict && "label" in dict) {
          this.cache.set(key, `${dict["concept"]}: ${dict["label"]}`);
        }
      }
    } catch (error) {
      console.error(`Error retrieving census field definitions: ${error}`);
    }

    return this.cache;
  }

  private async getCensusData(
    geoLevel: string = "block group",
    field: string,
    address: string
  ): Promise<any> {
    try {
      const coordinates = await getAddressCoordinates(address);

      const request = {
        vintage: this.defaultDataset,
        geoHierarchy: {
          [geoLevel]: {
            lat: coordinates.latitude,
            lng: coordinates.longitude,
          },
        },
        sourcePath: ["acs", "acs5"],
        values: [field],
        statsKey: this.apiKey,
      };

      let query_result: Map<string, any> = new Map<string, any>();

      census(request, (error: any, result: any) => {
        if (error) {
          console.error(error);
          return;
        }

        console.log(`Found data for address: ${address}`);
        query_result = result;
      });

      if (!query_result || query_result.size === 0) {
        console.warn(`Could not find census data for address: ${address}`);
        return null;
      }

      console.log(`Found data for address: ${address}`);
      const data = query_result.get(field);
      console.log(`Found ${field}: ${data}`);

      return data;
    } catch (error) {
      console.warn(`Error retrieving census data for address: ${address}`);
      console.error(error);
      return null;
    }
  }

  public async getDescriptionForField(
    year: number,
    dataSet: string,
    field: string
  ): Promise<string> {
    const fields = await this.getCensusFields(year, dataSet);
    if (!fields.has(field)) {
      return "";
    }

    const concept = fields.get(field)?.concept || "";
    const label = fields.get(field)?.label?.replace("!!", " ") || "";
    return `${concept}: ${label}`;
  }

  public async getAllFieldCodes(
    year: number,
    dataSet: string
  ): Promise<string[]> {
    const fields = await this.getCensusFields(year, dataSet);
    return Array.from(fields.keys());
  }

  public async getAllDescriptions(
    year: number,
    dataSet: string
  ): Promise<Map<string, string>> {
    const fields = await this.getCensusFields(year, dataSet);
    return fields;
  }
}

export default USCensusAPI;
