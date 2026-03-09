import {
  PM25ForecastDayDetails,
  PM25ForecastItem,
  PMForecastSevenDays,
} from "@/components/forecast/pm-forecast-seven-days";

function buildMockDetails(
  isoDate: string,
  pm: number,
  offset: number
): PM25ForecastDayDetails {
  return {
    date: isoDate,
    pm,
    temp: 28.4 + offset * 0.35,
    humidity: 58 + offset,
    wind_speed: 1.9 + offset * 0.22,
  };
}

function forecastItem(
  day: string,
  date: string,
  isoDate: string,
  value: number,
  trend: string,
  locationId: number,
  offset: number
) {
  return {
    day,
    date,
    value,
    trend,
    details: buildMockDetails(isoDate, value, offset),
  };
}

const PM25_FORECAST_ITEMS: PM25ForecastItem[] = [
  {
    provinceId: 1,
    provinceName: "กรุงเทพมหานคร",
    data: [
      forecastItem("Tue", "03 Mar", "2026-03-03", 36, "เริ่มสะสม", 1, -7),
      forecastItem("Wed", "04 Mar", "2026-03-04", 41, "เพิ่มขึ้นเล็กน้อย", 1, -6),
      forecastItem("Thu", "05 Mar", "2026-03-05", 47, "เพิ่มขึ้น", 1, -5),
      forecastItem("Fri", "06 Mar", "2026-03-06", 44, "ทรงตัว", 1, -4),
      forecastItem("Sat", "07 Mar", "2026-03-07", 39, "ลดลงเล็กน้อย", 1, -3),
      forecastItem("Sun", "08 Mar", "2026-03-08", 34, "อยู่ในเกณฑ์ปานกลาง", 1, -2),
      forecastItem("Mon", "09 Mar", "2026-03-09", 42, "เพิ่มขึ้นเล็กน้อย", 1, -1),
      forecastItem("Tue", "10 Mar", "2026-03-10", 38, "ปัจจุบันทรงตัว", 1, 0),
      forecastItem("Wed", "11 Mar", "2026-03-11", 29, "ลดลง", 1, 1),
      forecastItem("Thu", "12 Mar", "2026-03-12", 55, "เพิ่มขึ้น", 1, 2),
      forecastItem("Fri", "13 Mar", "2026-03-13", 61, "สูงต่อเนื่อง", 1, 3),
      forecastItem("Sat", "14 Mar", "2026-03-14", 34, "เริ่มดีขึ้น", 1, 4),
      forecastItem("Sun", "15 Mar", "2026-03-15", 22, "อยู่ในเกณฑ์ดี", 1, 5),
      forecastItem("Mon", "16 Mar", "2026-03-16", 27, "ยังคงดี", 1, 6),
      forecastItem("Tue", "17 Mar", "2026-03-17", 31, "เพิ่มขึ้นเล็กน้อย", 1, 7),
    ],
  },
  {
    provinceId: 2,
    provinceName: "เชียงใหม่",
    data: [
      forecastItem("Tue", "03 Mar", "2026-03-03", 79, "สูงมาก", 2, -7),
      forecastItem("Wed", "04 Mar", "2026-03-04", 76, "ลดลงเล็กน้อย", 2, -6),
      forecastItem("Thu", "05 Mar", "2026-03-05", 81, "กลับมาสูง", 2, -5),
      forecastItem("Fri", "06 Mar", "2026-03-06", 74, "ทรงตัว", 2, -4),
      forecastItem("Sat", "07 Mar", "2026-03-07", 71, "ลดลงเล็กน้อย", 2, -3),
      forecastItem("Sun", "08 Mar", "2026-03-08", 69, "ยังสูง", 2, -2),
      forecastItem("Mon", "09 Mar", "2026-03-09", 68, "สูง", 2, -1),
      forecastItem("Tue", "10 Mar", "2026-03-10", 72, "ปัจจุบันเพิ่มขึ้น", 2, 0),
      forecastItem("Wed", "11 Mar", "2026-03-11", 65, "ทรงตัว", 2, 1),
      forecastItem("Thu", "12 Mar", "2026-03-12", 58, "ลดลงเล็กน้อย", 2, 2),
      forecastItem("Fri", "13 Mar", "2026-03-13", 49, "ดีขึ้น", 2, 3),
      forecastItem("Sat", "14 Mar", "2026-03-14", 43, "ลดลงต่อเนื่อง", 2, 4),
      forecastItem("Sun", "15 Mar", "2026-03-15", 39, "เริ่มคงที่", 2, 5),
      forecastItem("Mon", "16 Mar", "2026-03-16", 35, "เข้าเกณฑ์ปานกลาง", 2, 6),
      forecastItem("Tue", "17 Mar", "2026-03-17", 33, "ดีขึ้นต่อเนื่อง", 2, 7),
    ],
  },
];

export default async function PMForecast({params} : {params: {id : string}}) {
  const {id} = await params ;
  return (
    <main className="mx-auto max-w-7xl p-6">
      <PMForecastSevenDays
        provinceId={Number(id)}
        forecastItems={PM25_FORECAST_ITEMS}
      />
    </main>
  );
}
