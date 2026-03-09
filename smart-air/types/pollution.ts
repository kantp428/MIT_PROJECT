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
