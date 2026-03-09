export interface PollutionPredictionRow {
  id: number;
  provinceName: string;
  PM25: number | null;
  predicted_at: string;
  latitude: number | null;
  longitude: number | null;
}

export interface PollutionPagination {
  totalPage: number;
  page: number;
  total: number;
  limit: number;
}

export interface PollutionPredictionResponse {
  data: PollutionPredictionRow[];
  pagination: PollutionPagination;
}

export type PollutionRecordType = "ACTUAL" | "PREDICTED";

export interface PollutionDayDetail {
  date: string;
  pm: number | null;
  temp: number | null;
  humidity: number | null;
  wind_speed: number | null;
}

export interface PollutionForecastDayItem {
  id: number;
  type: PollutionRecordType;
  day: string;
  date: string;
  isoDate: string;
  value: number | null;
  trend: string;
}

export interface PollutionForecastResponse {
  locationId: number;
  provinceName: string;
  data: PollutionForecastDayItem[];
}
