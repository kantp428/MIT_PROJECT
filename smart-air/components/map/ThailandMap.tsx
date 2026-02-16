"use client";
import { MapProps } from "@/types/air-quality";
import * as L from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { renderToString } from "react-dom/server";

// เพิ่ม Marker เข้ามาใน import
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

const ZoomHandler = ({ setZoom }: { setZoom: (z: number) => void }) => {
  useMapEvents({
    zoomend: (e) => {
      setZoom(e.target.getZoom());
    },
  });
  return null;
};

const ThailandMap: React.FC<MapProps> = ({ airData }) => {
  const [zoomLevel, setZoomLevel] = useState(6);

  const getAQIColor = (value: number): string => {
    if (value <= 15) return "oklch(0.75 0.18 145)";
    if (value <= 25) return "oklch(0.9 0.15 100)";
    if (value <= 37.5) return "oklch(0.7 0.18 45)";
    if (value <= 75) return "oklch(0.6 0.22 25)";
    return "oklch(0.45 0.15 310)";
  };

  // ฟังก์ชันสร้าง Custom Icon ที่มีตัวเลข
  const createCustomIcon = (
    stationName: string,
    pmValue: number,
    color: string,
  ) => {
    const showDetails = zoomLevel >= 10;

    return L.divIcon({
      html: renderToString(
        <div className="relative flex flex-col items-center justify-center">
          <MapPin
            size={showDetails ? 48 : 32}
            fill={color}
            fillOpacity={1} // ปรับทึบเพื่อให้ตัวเลขชัด
            color="white"
            strokeWidth={2}
          />
        </div>,
      ),
      className: "custom-div-icon",
      iconSize: showDetails ? [48, 48] : [32, 32],
      iconAnchor: showDetails ? [24, 48] : [16, 32],
      popupAnchor: [0, -45],
    });
  };

  return (
    <MapContainer
      center={[13.736, 100.523]}
      zoom={6}
      // 100vh คือเต็มจอ, ลบออก 80px (สมมติว่าเป็นความสูงของ Header)
      style={{ height: "calc(100vh - 150px)", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ZoomHandler setZoom={setZoomLevel} />

      {airData.map((station) => {
        const color = getAQIColor(station.pm25);

        return (
          <div key={station.id}>
            <Marker
              position={[station.lat, station.lng]}
              icon={createCustomIcon(station.name, station.pm25, color)}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold">{station.name}</h3>
                  <p>PM2.5: {station.pm25} µg/m³</p>
                </div>
              </Popup>
            </Marker>

            <Circle
              center={[station.lat, station.lng]}
              radius={8000}
              pathOptions={{ fillColor: color, color: color, fillOpacity: 0.2 }}
            />
          </div>
        );
      })}
    </MapContainer>
  );
};

export default ThailandMap;
