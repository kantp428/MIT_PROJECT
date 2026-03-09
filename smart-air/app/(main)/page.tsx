import {
  PM25ForecastItem,
  ProvinceOption,
  WeatherForecastSevenDays,
} from "@/components/forecast/weather-forecast-seven-days";

const PROVINCES: ProvinceOption[] = [
  { id: "TH-10", name: "กรุงเทพมหานคร" },
  { id: "TH-50", name: "เชียงใหม่" },
  { id: "TH-40", name: "ขอนแก่น" },
  { id: "TH-83", name: "ภูเก็ต" },
];

const PM25_FORECAST_ITEMS: PM25ForecastItem[] = [
  {
    provinceId: "TH-10",
    provinceName: "กรุงเทพมหานคร",
    data: [
      { day: "Mon", date: "09 Mar", value: 42, trend: "เพิ่มขึ้นเล็กน้อย", source: "จราจร + อากาศนิ่ง" },
      { day: "Tue", date: "10 Mar", value: 38, trend: "ทรงตัว", source: "ฝุ่นสะสมในเมือง" },
      { day: "Wed", date: "11 Mar", value: 29, trend: "ลดลง", source: "การระบายอากาศดีขึ้น" },
      { day: "Thu", date: "12 Mar", value: 55, trend: "เพิ่มขึ้น", source: "ฝุ่นสะสมช่วงเช้า" },
      { day: "Fri", date: "13 Mar", value: 61, trend: "สูงต่อเนื่อง", source: "อากาศนิ่ง + การเผาไหม้" },
      { day: "Sat", date: "14 Mar", value: 34, trend: "เริ่มดีขึ้น", source: "ลมช่วยพัดกระจาย" },
      { day: "Sun", date: "15 Mar", value: 22, trend: "อยู่ในเกณฑ์ดี", source: "สภาพอากาศเปิด" },
    ],
  },
  {
    provinceId: "TH-50",
    provinceName: "เชียงใหม่",
    data: [
      { day: "Mon", date: "09 Mar", value: 68, trend: "สูง", source: "การเผาไหม้สะสม" },
      { day: "Tue", date: "10 Mar", value: 72, trend: "เพิ่มขึ้น", source: "ฝุ่นข้ามพื้นที่" },
      { day: "Wed", date: "11 Mar", value: 65, trend: "ทรงตัว", source: "อากาศนิ่ง" },
      { day: "Thu", date: "12 Mar", value: 58, trend: "ลดลงเล็กน้อย", source: "ลมเริ่มพัด" },
      { day: "Fri", date: "13 Mar", value: 49, trend: "ดีขึ้น", source: "การระบายอากาศดีขึ้น" },
      { day: "Sat", date: "14 Mar", value: 43, trend: "ลดลงต่อเนื่อง", source: "มวลอากาศเปลี่ยน" },
      { day: "Sun", date: "15 Mar", value: 39, trend: "เริ่มคงที่", source: "ฝุ่นตกค้างลดลง" },
    ],
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl p-6">
      <WeatherForecastSevenDays
        provinceId="TH-10"
        provinces={PROVINCES}
        forecastItems={PM25_FORECAST_ITEMS}
      />
    </main>
  );
}
