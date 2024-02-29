import axios, { AxiosRequestConfig } from "axios";

import { ISITWATER_API_KEY } from "./constants";

export function generateMapsUrl(lat: string, lon: string) {
  // URL encode the latitude and longitude
  const encodedLat = encodeURIComponent(lat);
  const encodedLon = encodeURIComponent(lon);

  // Generate the URL
  const baseUrl = "https://www.google.com/maps/search/?api=1&query=";
  return `${baseUrl}${encodedLat}%2C${encodedLon}`;
}

interface IsItWaterResponseData {
  water: boolean;
  latitude: number;
  longitude: number;
}

export async function isWater(lat: number, lon: number): Promise<boolean> {
  /**
   * Given a latitude and longitude, check if the coordinate is over water.
   */
  const headers: AxiosRequestConfig["headers"] = {
    "X-RapidAPI-Key": ISITWATER_API_KEY,
    "X-RapidAPI-Host": "isitwater-com.p.rapidapi.com",
  };

  const params = {
    lattitude: lat,
    longitude: lon,
  };

  const url = "https://isitwater-com.p.rapidapi.com/";

  const response = await axios.get(url, {
    params: params,
    headers: headers,
    timeout: 5000,
  });

  const data: IsItWaterResponseData = response.data;
  return data.water;
}
