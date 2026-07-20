export interface ZoneData {
  id: string;
  name: string;
  region: string;
  x: number;
  z: number;
  pop: number;
  density: number;
  area: number;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  co: number;
  o3: number;
  temp: number;
  humidity: number;
  rainfall: number;
  vehicles: number;
  vdens: string;
  green: number;
  water: number;
  dataSource: string;
  stationType: "caaqms" | "manual" | "estimated";
  lastReading: string;
  oldAqi: number | null;
  oldPm25: number | null;
  oldPm10: number | null;
  oldTemp: number | null;
  desc: string;
  recs: string[];
}

export interface User {
  name: string;
  email: string;
  phone: string;
  age: number;
  occupation: string;
  avatar: string;
  createdAt: string;
  isVerified: boolean;
}

export interface HistoryRecord {
  timestamp: string;
  metrics: Array<{
    zoneId: string;
    aqi: number;
    temp: number;
    humidity: number;
    rainfall: number;
    vehicles: number;
  }>;
}

export interface SystemStatus {
  system: string;
  online: boolean;
  caaqmsStations: number;
  manualStations: number;
  estimatedStations: number;
  dataIntegrity: string;
  latency: string;
  countdown: number;
}

export type SelectedMetric =
  | "aqi"
  | "temp"
  | "humidity"
  | "rainfall"
  | "vehicles"
  | "population"
  | "density";
