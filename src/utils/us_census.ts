import axios from "axios";

interface GroupDetails {
  description: string;
  universe: string;
}

class USCensusAPI {
  private variable_cache: Map<string, any>;
  private group_cache: Map<string, any>;

  constructor() {
    this.variable_cache = new Map<string, string>();
    this.group_cache = new Map<string, GroupDetails>();
  }

  private async getCensusGroups(
    year: number,
    sourcePath: string[]
  ): Promise<Map<string, GroupDetails>> {
    if (this.group_cache.size > 0) {
      return this.group_cache;
    }

    const dataset = sourcePath.join("/").toLowerCase();
    const groupsUrl = `https://api.census.gov/data/${year.toString()}/${dataset}/groups.json`;

    try {
      const response = await axios.get(groupsUrl);
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
    } catch (error) {
      console.error(`Error retrieving census groups: ${error}`);
    }

    return this.group_cache;
  }

  private async getCensusFields(
    year: number,
    sourcePath: string[]
  ): Promise<Map<string, any>> {
    if (this.variable_cache.size > 0) {
      return this.variable_cache;
    }

    const dataset = sourcePath.join("/").toLowerCase();
    const definitionsUrl = `https://api.census.gov/data/${year.toString()}/${dataset}/variables.json`;

    try {
      const response = await axios.get(definitionsUrl);
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
    } catch (error) {
      console.error(`Error retrieving census field definitions: ${error}`);
    }

    return this.variable_cache;
  }

  public async getAllDescriptions(
    year: number,
    sourcePath: string[]
  ): Promise<Map<string, string>> {
    const fields = await this.getCensusFields(year, sourcePath);
    return fields;
  }

  public async getAllGroups(
    year: number,
    sourcePath: string[]
  ): Promise<Map<string, GroupDetails>> {
    const groups = await this.getCensusGroups(year, sourcePath);
    return groups;
  }
}

export default USCensusAPI;
