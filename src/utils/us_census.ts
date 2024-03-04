import axios from "axios";

interface GroupDetails {
  description: string;
  universe: string;
}

export type CensusVariablesDataType = Map<string, string>;
export type CensusGroupDataType = Map<string, GroupDetails>;

export const validCensusYears = [2022];

class USCensusAPI {
  private variable_cache: CensusVariablesDataType;
  private group_cache: CensusGroupDataType;
  private variable_year: number;
  private group_year: number;
  private defaultTimeout = 30000;

  constructor() {
    this.variable_cache = new Map<string, string>();
    this.group_cache = new Map<string, GroupDetails>();
    this.variable_year = validCensusYears[validCensusYears.length - 1];
    this.group_year = validCensusYears[validCensusYears.length - 1];
  }

  private async getCensusGroups(
    year: number,
    sourcePath: string[]
  ): Promise<CensusGroupDataType> {
    if (this.group_cache.size > 0 && year === this.group_year) {
      return this.group_cache;
    }

    this.group_cache = new Map<string, GroupDetails>();

    const dataset = sourcePath.join("/").toLowerCase();
    const groupsUrl = `https://api.census.gov/data/${year.toString()}/${dataset}/groups.json`;

    try {
      const response = await axios.get(groupsUrl, {
        timeout: this.defaultTimeout,
      });
      const data = response.data;

      for (const item of data["groups"]) {
        const { name, description } = item;
        const universe = item["universe "]; // there's an annoying trailing space in the key name!!
        if (name && description && universe) {
          this.group_cache.set(name, {
            description: description.replaceAll("!!", " "),
            universe: universe,
          });
        }
      }
      this.group_year = year;
    } catch (error) {
      console.error(`Error retrieving census groups: ${error}`);
    }

    return this.group_cache;
  }

  private async getCensusFields(
    year: number,
    sourcePath: string[]
  ): Promise<Map<string, any>> {
    if (this.variable_cache.size > 0 && year === this.variable_year) {
      return this.variable_cache;
    }

    this.variable_cache = new Map<string, string>();

    const dataset = sourcePath.join("/").toLowerCase();
    const definitionsUrl = `https://api.census.gov/data/${year.toString()}/${dataset}/variables.json`;

    try {
      const response = await axios.get(definitionsUrl, {
        timeout: this.defaultTimeout,
      });
      const data = response.data;

      for (const [key, elem] of Object.entries(data["variables"])) {
        if (key === "for" || key === "in") {
          continue;
        }

        const dict = elem as any;

        if ("concept" in dict && "label" in dict) {
          this.variable_cache.set(key, `${dict["concept"]}: ${dict["label"]}`);
        }
      }
      this.variable_year = year;
    } catch (error) {
      console.error(`Error retrieving census field definitions: ${error}`);
    }

    return this.variable_cache;
  }

  public async getAllVariables(
    year: number,
    sourcePath: string[]
  ): Promise<CensusVariablesDataType> {
    const fields = await this.getCensusFields(year, sourcePath);
    return fields;
  }

  public async getAllGroups(
    year: number,
    sourcePath: string[]
  ): Promise<CensusGroupDataType> {
    const groups = await this.getCensusGroups(year, sourcePath);
    return groups;
  }
}

export default USCensusAPI;
