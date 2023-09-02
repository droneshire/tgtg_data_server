import firebase from "firebase/app";

export enum ClientAction {
  NONE = "NONE",
  DELETE = "DELETE",
  ADD = "ADD",
}

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

export interface Searches {
  items: {
    [id: string]: {
      region: Region;
      sendEmail: boolean;
    };
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
  searchTimeZone: SearchTimeZone;
}

export interface ClientConfig {
  preferences: Preferences;
  searches: Searches;
}

export const DEFAULT_USER_CONFIG = {
  preferences: {
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
    hoursBetweenCollection: 3,
    collectionTimeStart: 6,
  },
}
