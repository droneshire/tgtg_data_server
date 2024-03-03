import { Coordinates, Grid } from "utils/demographics";

export enum ClientAction {
  NONE = "NONE",
  DELETE = "DELETE",
  ADD = "ADD",
}

export const hourDivisors: number[] = [1, 2, 3, 4, 6, 8, 12, 24];

export interface Region {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface SearchTimeZone {
  abbrev: string;
  altName: string;
  label: string;
  offset: number;
  value: string;
}

export interface Search {
  region: Region;
  sendEmail: boolean;
  eraseData: boolean;
  uploadOnly: boolean;
  lastSearchTime: number;
  lastDownloadTime: number;
  numResults: number;
  uuid: string;
}

export interface Searches {
  items: {
    [id: string]: Search;
  };
  hoursBetweenCollection: number;
  collectionTimeStart: number;
}

export interface Preferences {
  notifications: {
    email: {
      email: string;
      updatesEnabled: boolean;
    };
  };
  deleteDataOnDownload: boolean;
  storeRawData: boolean;
  searchTimeZone: SearchTimeZone;
}

export interface CensusDetails {
  year: number;
  sourcePath: string;
  fields: {
    [code: string]: string;
  };
}

export interface SearchContext {
  city: string;
  cityCenter: Coordinates;
  radiusMiles: number;
  totalCost: number;
  numberOfSquares: number;
  gridWidthMeters: number;
  triggerSearch: boolean;
  autoUpload: boolean;
  maxCostPerCity: number;
  costPerSquare: number;
  censusDetails: CensusDetails;
}

export interface ClientConfig {
  preferences: Preferences;
  searches: Searches;
  searchContext: SearchContext;
}

export const DEFAULT_USER_CONFIG: ClientConfig = {
  preferences: {
    deleteDataOnDownload: false,
    storeRawData: false,
    notifications: {
      email: { email: "", updatesEnabled: true },
    },
    searchTimeZone: {
      abbrev: "PDT",
      altName: "Pacific Daylight Time",
      label: "(GMT-07:00) Pacific Time",
      offset: -7,
      value: "America/Los_Angeles",
    },
  },
  searches: {
    items: {},
    hoursBetweenCollection: Math.min(...hourDivisors),
    collectionTimeStart: 6,
  },
  searchContext: {
    city: "",
    cityCenter: { latitude: 0, longitude: 0 },
    radiusMiles: 0,
    totalCost: 0,
    numberOfSquares: 0,
    gridWidthMeters: 0,
    triggerSearch: false,
    autoUpload: false,
    maxCostPerCity: 0,
    costPerSquare: 0,
    censusDetails: {
      year: 0,
      sourcePath: "",
      fields: {},
    },
  },
};
