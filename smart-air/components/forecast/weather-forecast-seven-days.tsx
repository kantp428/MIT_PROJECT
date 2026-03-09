import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPM25Constant } from "@/lib/utils";
import { Activity, CalendarRange, Wind } from "lucide-react";

export interface ProvinceOption {
  id: string;
  name: string;
}

export interface PM25ForecastDayItem {
  day: string;
  date: string;
  value: number;
  trend: string;
  source: string;
}

export interface PM25ForecastItem {
  provinceId: string;
  provinceName: string;
  data: PM25ForecastDayItem[];
}

interface WeatherForecastSevenDaysProps {
  provinceId?: string;
  provinces?: ProvinceOption[];
  forecastItems?: PM25ForecastItem[];
  title?: string;
  actionLabel?: string;
}

const DEFAULT_PROVINCES: ProvinceOption[] = [
  { id: "TH-10", name: "กรุงเทพมหานคร" },
  { id: "TH-50", name: "เชียงใหม่" },
  { id: "TH-40", name: "ขอนแก่น" },
  { id: "TH-83", name: "ภูเก็ต" },
];

const DEFAULT_FORECAST_ITEMS: PM25ForecastItem[] = [
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
];

export function WeatherForecastSevenDays({
  provinceId = "TH-10",
  provinces = DEFAULT_PROVINCES,
  forecastItems = DEFAULT_FORECAST_ITEMS,
  title = "7 Days PM2.5 Forecast",
  actionLabel = "Mock PM2.5",
}: WeatherForecastSevenDaysProps) {
  const province =
    provinces.find((item) => item.id === provinceId) ?? provinces[0];

  const selectedForecast =
    forecastItems.find((item) => item.provinceId === provinceId) ??
    forecastItems.find((item) => item.provinceName === province?.name) ??
    forecastItems[0];

  const visibleItems = selectedForecast?.data.slice(0, 7) ?? [];
  const today = visibleItems[0];

  if (!province || !selectedForecast || visibleItems.length === 0 || !today) {
    return null;
  }

  const todayStatus = getPM25Constant(today.value);
  const range = `${visibleItems[0].date} - ${visibleItems[visibleItems.length - 1].date}`;

  return (
    <section className="rounded-[1.75rem] border bg-card p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-7 w-1.5 rounded-full bg-primary" />
            <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {selectedForecast.provinceName}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {selectedForecast.provinceId}
            </Badge>
            <span>{range}</span>
          </div>
        </div>

        <Button variant="outline" className="w-fit rounded-full">
          {actionLabel}
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[1.5rem] border border-border/60 bg-[linear-gradient(135deg,#f4ede3_0%,#fbf7f1_58%,#e6f2ee_100%)] p-5">
          <p className="text-sm font-medium text-muted-foreground">Overview</p>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {today.day}, {today.date}
              </p>
              <h4 className="mt-2 text-3xl font-semibold">
                {today.value} <span className="text-lg text-muted-foreground">µg/m3</span>
              </h4>
              <p className="mt-2 text-base font-medium">{todayStatus.labelTh}</p>
              <p className="mt-1 text-sm text-foreground/70">{today.trend}</p>
            </div>
            <div
              className="rounded-3xl p-4 text-white shadow-sm"
              style={{ backgroundColor: todayStatus.color }}
            >
              <Wind className="size-10" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/75 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Status
              </p>
              <p className="mt-2 text-lg font-semibold" style={{ color: todayStatus.color }}>
                {todayStatus.labelEn}
              </p>
            </div>
            <div className="rounded-2xl bg-white/75 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Main Factor
              </p>
              <p className="mt-2 text-sm font-medium leading-6">{today.source}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-3">
            {visibleItems.map((item) => {
              const status = getPM25Constant(item.value);

              return (
                <article
                  key={`${selectedForecast.provinceId}-${item.day}-${item.date}`}
                  className="w-[220px] shrink-0 rounded-[1.5rem] border border-border/60 bg-background p-4 transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {item.day}
                      </p>
                      <h4 className="mt-1 text-lg font-semibold">{item.date}</h4>
                    </div>
                    <div
                      className="rounded-2xl p-3 text-white"
                      style={{ backgroundColor: status.color }}
                    >
                      <Activity className="size-5" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-base font-medium">{status.labelTh}</p>
                    <p className="text-sm text-foreground/70">{item.trend}</p>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        PM2.5
                      </p>
                      <p className="mt-1 text-xl font-semibold">
                        {item.value} <span className="text-sm text-muted-foreground">µg/m3</span>
                      </p>
                    </div>
                    <div className="max-w-24 text-right text-sm text-muted-foreground">
                      <p>{status.labelEn}</p>
                      <p className="line-clamp-2">{item.source}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarRange className="size-4" />
        <span>Mock 7-day PM2.5 trend for UI testing only.</span>
      </div>
    </section>
  );
}
