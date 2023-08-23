
export enum ClientAction {
  NONE = "NONE",
  DELETE = "DELETE",
  ADD = "ADD",
}

export interface Region {
  lattitude: number;
  longitude: number;
  radius: number;
}


export interface Preferences {
  notifications: {
    sms: {
      phoneNumber: string;
      updatesEnabled: boolean;
    };
    email: {
      email: string;
      updatesEnabled: boolean;
    };
  };
}

export interface ClientConfig {
  preferences: Preferences;
  regions: Region[];
}

export const DEFAULT_USER_CONFIG = {
  preferences: {
    notifications: {
      email: { email: "", updatesEnabled: true },
      sms: {
        phoneNumber: "",
        updatesEnabled: true,
      },
    },
  },
  regions: [],
}
