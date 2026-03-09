"use client";

import { useEffect, useRef } from "react";

import { PollutionDayDetailDialog } from "@/components/forecast/pollution-day-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPM25Constant } from "@/lib/utils";
import type { PollutionRecordType } from "@/types/pollution";
import {
  Activity,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface PM25ForecastDayItem {
  id: number;
  type: PollutionRecordType;
  day: string;
  date: string;
  isoDate?: string;
  value: number | null;
  trend: string;
}

export interface PM25ForecastItem {
  locationId: number;
  provinceName: string;
  data: PM25ForecastDayItem[];
}

interface PMForecastSevenDaysProps {
  forecastItem: PM25ForecastItem;
  title?: string;
  actionLabel?: string;
}

const formatPMValue = (value: number | null) => (value === null ? "-" : value);

export function PMForecastSevenDays({
  forecastItem,
  title = "7 Days Before & After PM2.5",
  actionLabel = "PM2.5",
}: PMForecastSevenDaysProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayCardRef = useRef<HTMLElement>(null);

  const visibleItems = forecastItem?.data ?? [];
  const todayIndex = Math.floor(visibleItems.length / 2);
  const today = visibleItems[todayIndex];

  useEffect(() => {
    const container = scrollContainerRef.current;
    const todayCard = todayCardRef.current;

    if (!container || !todayCard) {
      return;
    }

    const targetScrollLeft =
      todayCard.offsetLeft -
      (container.clientWidth - todayCard.clientWidth) / 2;

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: "smooth",
    });
  }, []);

  if (visibleItems.length === 0 || !today) {
    return null;
  }

  const range = `${visibleItems[0].date} - ${visibleItems[visibleItems.length - 1].date}`;

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
      container.querySelectorAll<HTMLElement>("[data-forecast-card='true']"),
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
              {forecastItem.provinceName}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {forecastItem.locationId}
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
              const status =
                item.value === null
                  ? { color: "#64748b", labelTh: "No data" }
                  : getPM25Constant(item.value);
              const isToday = index === todayIndex;

              return (
                <article
                  data-forecast-card="true"
                  ref={isToday ? todayCardRef : null}
                  key={`${forecastItem.locationId}-${item.day}-${item.date}`}
                  className={`flex shrink-0 snap-center self-center flex-col justify-between rounded-[1.75rem] border p-5 transition-all duration-200 hover:-translate-y-1 ${
                    isToday
                      ? "h-90 w-70 border-primary bg-[linear-gradient(160deg,hsl(var(--primary)/0.16)_0%,hsl(var(--background))_58%,hsl(var(--primary)/0.08)_100%)] shadow-lg ring-2 ring-primary/20"
                      : "h-72 w-70 border-border/60 bg-background"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className={`${isToday ? "text-base" : "text-sm"} font-medium text-muted-foreground`}
                        >
                          {item.day}
                        </p>
                        <h4
                          className={`${isToday ? "mt-1 text-2xl" : "mt-1 text-lg"} font-semibold`}
                        >
                          {item.date}
                        </h4>
                        {isToday ? (
                          <Badge className="mt-3 rounded-full px-3 py-1">
                            Today
                          </Badge>
                        ) : null}
                      </div>
                      <div
                        className={`${isToday ? "rounded-3xl p-4" : "rounded-2xl p-3"} text-white`}
                        style={{ backgroundColor: status.color }}
                      >
                        <Activity className={isToday ? "size-7" : "size-5"} />
                      </div>
                    </div>

                    <div
                      className={`${isToday ? "mt-6 space-y-3" : "mt-4 space-y-2"}`}
                    >
                      <p
                        className={`${isToday ? "text-xl" : "text-base"} font-medium`}
                      >
                        {status.labelTh}
                      </p>
                      <p
                        className={`${isToday ? "text-base leading-7" : "text-sm"} text-foreground/70`}
                      >
                        {item.trend}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`${isToday ? "mt-6" : "mt-4"} flex items-end justify-between gap-3`}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        PM2.5
                      </p>
                      <p
                        className={`${isToday ? "mt-2 text-4xl" : "mt-1 text-xl"} font-semibold`}
                      >
                        {formatPMValue(item.value)}{" "}
                        <span
                          className={`${isToday ? "text-base" : "text-sm"} text-muted-foreground`}
                        >
                          ug/m3
                        </span>
                      </p>
                    </div>
                    <PollutionDayDetailDialog type={item.type} id={item.id} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarRange className="size-4" />
        <span>
          PM2.5 timeline with 7 days before and 7 days after the current day.
        </span>
      </div>
    </section>
  );
}
