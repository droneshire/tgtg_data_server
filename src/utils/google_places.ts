/**
 * Google Places API wrapper
 *
 * https://developers.google.com/maps/documentation/places/web-service/overview
 * https://developers.google.com/maps/documentation/places/web-service/text-search
 */

import axios, { AxiosRequestConfig } from "axios";
import { Coordinates, Viewport, getViewport } from "./demographics";

interface Circle {
  center: Coordinates;
  radius: number;
}

interface LocationBias {
  circle?: Circle;
  rectangle?: Viewport;
}

interface LocationRestriction {
  rectangle: Viewport;
}

interface TextSearchData {
  textQuery?: string;
  locationBias?: LocationBias;
  locationRestriction?: LocationRestriction;
  includedType?: string;
}

type GooglePlacesAPIResponse = { [key: string]: any } | null;

class GooglePlacesAPI {
  private readonly base_url: string;
  private readonly headers: AxiosRequestConfig["headers"];
  private readonly defaultFields: string;
  private readonly minViewpointWidthMeters: number;
  private readonly maxViewpointWidthMeters: number;
  private readonly viewpointWidthStepMeters: number;
  private apiCalls: number;

  constructor(
    private readonly api_key: string,
    private readonly verbose: boolean = true
  ) {
    this.base_url = "https://places.googleapis.com/v1";
    this.headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": this.api_key,
      "X-Goog-FieldMask": "",
    };
    this.defaultFields = "places.formattedAddress,places.displayName";
    this.minViewpointWidthMeters = 100.0;
    this.maxViewpointWidthMeters = 500.0;
    this.viewpointWidthStepMeters = 50.0;
    this.apiCalls = 0;
  }

  private async postRequest(
    url: string,
    data: any
  ): Promise<GooglePlacesAPIResponse> {
    try {
      const response = await axios.post(url, data, {
        headers: this.headers,
        timeout: 10000,
      });
      this.apiCalls++;
      if (this.verbose) {
        console.log(`API calls: ${this.apiCalls}`);
      }
      return response.data;
    } catch (error) {
      console.error(`Could not make POST request to ${url}`);
      console.error(error);
      return null;
    }
  }

  public async textSearch(
    query: string,
    fields?: string[],
    data?: TextSearchData
  ): Promise<GooglePlacesAPIResponse> {
    const json_data: TextSearchData = {
      textQuery: query,
      ...data,
    };

    if (this.verbose) {
      console.log(`Searching for ${query}`);
      console.log(`Data: ${JSON.stringify(json_data, null, 2)}`);
    }

    if (this.headers) {
      this.headers["X-Goog-FieldMask"] =
        fields?.join(",") ?? this.defaultFields;
    }
    const url = `${this.base_url}/places:searchText`;
    return this.postRequest(url, json_data);
  }

  public async searchLocationRadius(
    latitude: number,
    longitude: number,
    radius_miles: number,
    query: string,
    fields?: string[],
    included_type?: string
  ): Promise<GooglePlacesAPIResponse> {
    const radius_meters = Math.min(
      radius_miles * 1609.34,
      this.maxViewpointWidthMeters
    );

    if (this.verbose) {
      console.log(
        `Searching for ${query} within ${radius_miles} miles of ${latitude}, ${longitude}`
      );
    }

    const json_data: TextSearchData = {
      locationBias: {
        circle: {
          center: { latitude, longitude },
          radius: radius_meters,
        },
      },
    };

    if (included_type) {
      json_data.includedType = included_type;
    }

    if (this.verbose) {
      console.log(`Data: ${JSON.stringify(json_data, null, 2)}`);
    }

    return this.textSearch(query, fields, json_data);
  }

  public async findMaximumViewpointWidth(
    latitude: number,
    longitude: number,
    query: string,
    fields?: string[]
  ): Promise<number> {
    let viewpoint_width_meters = this.minViewpointWidthMeters;

    while (viewpoint_width_meters < this.maxViewpointWidthMeters) {
      if (this.verbose) {
        console.log(
          `Searching for ${query} with viewpoint width ${viewpoint_width_meters} meters`
        );
      }

      const rect_viewpoint = getViewport(
        latitude,
        longitude,
        viewpoint_width_meters
      );
      const data = { locationRestriction: { rectangle: rect_viewpoint } };
      const results = await this.textSearch(query, fields, data);

      if (this.verbose) {
        console.log(`Results: ${JSON.stringify(results, null, 2)}`);
      }

      if (!results) {
        return 0;
      } else if (results.places) {
        if (this.verbose) {
          console.log(
            `Found ${results.places.length} results with viewpoint width ${viewpoint_width_meters} meters`
          );
        }

        if (results.places.length >= 20) {
          return viewpoint_width_meters - this.viewpointWidthStepMeters;
        }
      }

      viewpoint_width_meters += this.viewpointWidthStepMeters;
    }

    return viewpoint_width_meters;
  }
}

export default GooglePlacesAPI;

export type { GooglePlacesAPIResponse, TextSearchData };
