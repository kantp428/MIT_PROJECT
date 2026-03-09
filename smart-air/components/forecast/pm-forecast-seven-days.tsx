"use client";

import { useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getPM25Constant } from "@/lib/utils";
import {
  Activity,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Droplets,
  EllipsisVertical,
  Thermometer,
  Wind,
} from "lucide-react";

export interface PM25ForecastDayDetails {
  date: string;
  pm: number | null;
  temp: number | null;
  humidity: number | null;
  wind_speed: number | null;
}

export interface PM25ForecastDayItem {
  day: string;
  date: string;
  value: number;
  trend: string;
  details: PM25ForecastDayDetails;
}

export interface PM25ForecastItem {
  provinceId: number;
  provinceName: string;
  data: PM25ForecastDayItem[];
}

interface PMForecastSevenDaysProps {
  provinceId?: number;
  forecastItems?: PM25ForecastItem[];
  title?: string;
  actionLabel?: string;
}

export function PMForecastSevenDays({
  provinceId,
  forecastItems,
  title = "7 Days Before & After PM2.5",
  actionLabel = "PM2.5",
}: PMForecastSevenDaysProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayCardRef = useRef<HTMLElement>(null);

  const selectedForecast =
    forecastItems?.find((item) => item.provinceId === provinceId) ??
    forecastItems?.find((item) => item.provinceName) ??
    forecastItems?.[0];

  const visibleItems = selectedForecast?.data ?? [];
  const todayIndex = Math.floor(visibleItems.length / 2);
  const today = visibleItems[todayIndex];

  useEffect(() => {
    const container = scrollContainerRef.current;
    const todayCard = todayCardRef.current;

    if (!container || !todayCard) {
      return;
    }

    const targetScrollLeft =
      todayCard.offsetLeft - (container.clientWidth - todayCard.clientWidth) / 2;

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: "smooth",
    });
  }, [provinceId, selectedForecast?.provinceId]);

  if (!provinceId || !selectedForecast || visibleItems.length === 0 || !today) {
    return null;
  }

  const range = `${visibleItems[0].date} - ${visibleItems[visibleItems.length - 1].date}`;
  const formatNumber = (value: number | null, digits = 2) =>
    value === null ? "-" : value.toFixed(digits);

  const popupMetrics = (details: PM25ForecastDayDetails) => [
    { label: "Temp", value: formatNumber(details.temp, 2), icon: Thermometer, unit: "C" },
    { label: "Humidity", value: details.humidity === null ? "-" : details.humidity.toString(), icon: Droplets, unit: "%" },
    { label: "Wind Speed", value: formatNumber(details.wind_speed, 2), icon: Wind, unit: "m/s" },
  ];

  const scrollToCard = (card: HTMLElement | null) => {
    const container = scrollContainerRef.current;

    if (!container || !card) {
      return;
    }

    const targetScrollLeft =
      card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: "smooth",
    });
  };

  const scrollByCards = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    const cards = Array.from(
      container.querySelectorAll<HTMLElement>("[data-forecast-card='true']")
    );

    if (cards.length === 0) {
      return;
    }

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let currentIndex = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        currentIndex = index;
      }
    });

    const nextIndex =
      direction === "left"
        ? Math.max(0, currentIndex - 1)
        : Math.min(cards.length - 1, currentIndex + 1);

    scrollToCard(cards[nextIndex]);
  };

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

      <div className="relative mt-6">
        <Button
          variant="outline"
          size="icon-lg"
          className="absolute left-2 top-1/2 z-10 size-12 -translate-y-1/2 rounded-full border-border/80 bg-background/95 shadow-lg backdrop-blur sm:left-4 sm:size-14"
          onClick={() => scrollByCards("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft className="size-6 sm:size-7" />
        </Button>
        <Button
          variant="outline"
          size="icon-lg"
          className="absolute right-2 top-1/2 z-10 size-12 -translate-y-1/2 rounded-full border-border/80 bg-background/95 shadow-lg backdrop-blur sm:right-4 sm:size-14"
          onClick={() => scrollByCards("right")}
          aria-label="Scroll right"
        >
          <ChevronRight className="size-6 sm:size-7" />
        </Button>

        <div
          ref={scrollContainerRef}
          className="snap-x snap-mandatory overflow-x-auto pb-3 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex min-w-max items-stretch gap-4 px-[calc(50%-140px)]">
            {visibleItems.map((item, index) => {
              const status = getPM25Constant(item.value);
              const isToday = index === todayIndex;
              const metrics = popupMetrics(item.details);

              return (
                <article
                  data-forecast-card="true"
                  ref={isToday ? todayCardRef : null}
                  key={`${selectedForecast.provinceId}-${item.day}-${item.date}`}
                  className={`flex shrink-0 snap-center self-center flex-col justify-between rounded-[1.75rem] border p-5 transition-all duration-200 hover:-translate-y-1 ${
                    isToday
                      ? "h-[360px] w-[280px] border-primary bg-[linear-gradient(160deg,hsl(var(--primary)/0.16)_0%,hsl(var(--background))_58%,hsl(var(--primary)/0.08)_100%)] shadow-lg ring-2 ring-primary/20"
                      : "h-[288px] w-[280px] border-border/60 bg-background"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`${isToday ? "text-base" : "text-sm"} font-medium text-muted-foreground`}>
                          {item.day}
                        </p>
                        <h4 className={`${isToday ? "mt-1 text-2xl" : "mt-1 text-lg"} font-semibold`}>
                          {item.date}
                        </h4>
                        {isToday ? (
                          <Badge className="mt-3 rounded-full px-3 py-1">วันนี้</Badge>
                        ) : null}
                      </div>
                      <div
                        className={`${isToday ? "rounded-3xl p-4" : "rounded-2xl p-3"} text-white`}
                        style={{ backgroundColor: status.color }}
                      >
                        <Activity className={isToday ? "size-7" : "size-5"} />
                      </div>
                    </div>

                    <div className={`${isToday ? "mt-6 space-y-3" : "mt-4 space-y-2"}`}>
                      <p className={`${isToday ? "text-xl" : "text-base"} font-medium`}>{status.labelTh}</p>
                      <p className={`${isToday ? "text-base leading-7" : "text-sm"} text-foreground/70`}>
                        {item.trend}
                      </p>
                    </div>
                  </div>

                  <div className={`${isToday ? "mt-6" : "mt-4"} flex items-end justify-between gap-3`}>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        PM2.5
                      </p>
                      <p className={`${isToday ? "mt-2 text-4xl" : "mt-1 text-xl"} font-semibold`}>
                        {item.value}{" "}
                        <span className={`${isToday ? "text-base" : "text-sm"} text-muted-foreground`}>
                          µg/m3
                        </span>
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size={isToday ? "icon" : "icon-sm"}
                          className="rounded-full text-muted-foreground hover:bg-black/5"
                          aria-label={`Open details for ${item.date}`}
                        >
                          <EllipsisVertical className={isToday ? "size-6" : "size-5"} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className="top-4 right-4 left-auto translate-x-0 translate-y-0 max-w-[380px] overflow-hidden rounded-2xl border-0 p-0 shadow-2xl sm:top-6 sm:right-6"
                        closeButtonClassName="top-3 right-3 rounded-full bg-white/14 p-1.5 text-white opacity-100 hover:bg-white/20 hover:text-white [&_svg:not([class*='size-'])]:size-6"
                      >
                        <DialogHeader className="sr-only">
                          <DialogTitle>Forecast Snapshot</DialogTitle>
                          <DialogDescription>
                            Compact PM2.5 and weather summary for this day.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="overflow-hidden rounded-2xl">
                          <div
                            className="flex flex-col gap-3 p-4 text-white"
                            style={{
                              background: `linear-gradient(160deg, ${status.color} 0%, #4338ca 100%)`,
                            }}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex min-w-0 items-center gap-4">
                                <div className="flex flex-none flex-col items-center justify-center rounded-lg bg-white/16 px-3 py-2 text-center backdrop-blur">
                                  <p className="text-2xl font-semibold leading-none">{item.value}</p>
                                  <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/80">
                                    PM2.5
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm text-white/75">
                                    {selectedForecast.provinceName} • {item.details.date}
                                  </p>
                                  <p className="mt-1 line-clamp-2 text-base font-semibold">
                                    {status.labelTh}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="h-px w-full bg-black/10" />

                            <div className="flex items-center justify-between gap-3 text-sm">
                              <div className="flex items-center gap-1.5">
                                <span className="text-white/80">สารมลพิษหลัก:</span>
                                <span className="font-semibold">PM2.5</span>
                              </div>
                              <p className="font-semibold">
                                {formatNumber(item.details.pm, 2)} <span className="text-white/80">ug/m3</span>
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 bg-white px-4 py-3 text-slate-900">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              {metrics.slice(0, 3).map((field) => {
                                const Icon = field.icon;

                                return (
                                  <div key={`${item.date}-${field.label}`} className="min-w-0">
                                    <div className="mb-1 flex items-center gap-1.5 text-slate-500">
                                      <Icon className="size-4" />
                                      <span className="text-[11px] uppercase tracking-[0.16em]">
                                        {field.label}
                                      </span>
                                    </div>
                                    <p className="truncate text-sm font-semibold">
                                      {field.value} <span className="text-xs font-normal text-slate-500">{field.unit}</span>
                                    </p>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {metrics.slice(3).map((field) => {
                                const Icon = field.icon;

                                return (
                                  <div key={`${item.date}-${field.label}`} className="min-w-0">
                                    <div className="mb-1 flex items-center gap-1.5 text-slate-500">
                                      <Icon className="size-4" />
                                      <span className="text-[11px] uppercase tracking-[0.16em]">
                                        {field.label}
                                      </span>
                                    </div>
                                    <p className="truncate text-sm font-semibold">
                                      {field.value} <span className="text-xs font-normal text-slate-500">{field.unit}</span>
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarRange className="size-4" />
        <span>PM2.5 timeline with 7 days before and 7 days after the current day.</span>
      </div>
    </section>
  );
}
