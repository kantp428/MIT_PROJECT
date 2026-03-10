"use client";
import { getPM25Constant } from "@/lib/utils";
import { MapProps } from "@/types/air-quality";
import * as L from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet/dist/leaflet.css";
import { CloudFog, MapPin } from "lucide-react";
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

  // ฟังก์ชันสร้าง Custom Icon ที่มีตัวเลข
  const createCustomIcon = (color: string) => {
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
      style={{
        height: "calc(100vh - 64px)",
        width: "100%",
        zIndex: 0,
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ZoomHandler setZoom={setZoomLevel} />

      {airData.map((station) => {
        const color = getPM25Constant(station.pm25).color;

        return (
          <div key={station.id}>
            <Marker
              position={[station.lat, station.lng]}
              icon={createCustomIcon(color)}
            >
              <Popup className="station-popup">
                <div className="flex flex-col gap-3 p-1 min-w-45 bg-white text-slate-900 rounded-lg">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="font-sans font-bold text-base text-slate-900 leading-none">
                      {station.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-medium">
                      Air Quality Monitoring
                    </p>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-sans font-medium text-slate-500 uppercase">
                        PM 2.5
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-sans font-black text-2xl tracking-tighter text-slate-900 pr-0.5">
                          {station.pm25}
                        </span>
                        <span className="text-[13px] text-slate-500 font-medium">
                          µg/m³
                        </span>
                      </div>
                    </div>

                    <div
                      className="size-10 rounded-full flex items-center justify-center shadow-md"
                      style={{
                        backgroundColor: getPM25Constant(station.pm25).color,
                        boxShadow: `0 0 12px ${getPM25Constant(station.pm25).color}50`,
                      }}
                    >
                      <CloudFog className="size-5 text-white" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-sans text-[12px] font-medium text-slate-500 uppercase tracking-tight">
                      สถานะปัจจุบัน
                    </span>
                    <div
                      className="px-2 py-1 rounded-md text-xs font-sans font-medium text-center border"
                      style={{
                        borderColor: getPM25Constant(station.pm25).color,
                        color: getPM25Constant(station.pm25).color,
                        backgroundColor: `${getPM25Constant(station.pm25).color}10`,
                      }}
                    >
                      {getPM25Constant(station.pm25).labelTh}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>

            <Circle
              center={[station.lat, station.lng]}
              radius={2000}
              pathOptions={{ fillColor: color, color: color, fillOpacity: 0.2 }}
            />
          </div>
        );
      })}
    </MapContainer>
  );
};

export default ThailandMap;
