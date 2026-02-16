export interface AirStation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  pm25: number;
  lastUpdated: string;
}

export interface MapProps {
  airData: AirStation[];
  geoData?: any;
}
