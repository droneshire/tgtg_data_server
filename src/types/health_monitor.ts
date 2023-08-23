import { Timestamp } from "firebase/firestore"

export interface HealthMonitorConfig {
    ping: Timestamp;
    reset: boolean;
};
