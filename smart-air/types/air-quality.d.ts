export interface AirStation {
  id: number;
  name: string;
  province: string;
  lat: number;
  lng: number;
  pm25: number;
  lastUpdated: string;
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: unknown[];
  [key: string]: unknown;
}

export interface MapProps {
  airData: AirStation[];
  geoData?: GeoJsonFeatureCollection;
}
