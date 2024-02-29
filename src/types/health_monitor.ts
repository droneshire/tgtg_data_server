import { Timestamp } from "firebase/firestore";

export interface HealthMonitorConfig {
  heartbeat: Timestamp;
  reset: boolean;
}
