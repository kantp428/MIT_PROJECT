"use client";

import * as React from "react";

import { usePollutionDayDetail } from "@/hooks/use-pollution-day-detail";
import { getPM25Constant } from "@/lib/utils";
import type { PollutionRecordType } from "@/types/pollution";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Droplets, EllipsisVertical, Thermometer, Wind } from "lucide-react";

interface PollutionDayDetailDialogProps {
  type: PollutionRecordType;
  id: number;
}

const formatNumber = (value: number | null, digits = 2) =>
  value === null ? "-" : value.toFixed(digits);

export function PollutionDayDetailDialog({
  type,
  id,
}: PollutionDayDetailDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { data, isLoading, error } = usePollutionDayDetail({
    type,
    id,
    enabled: open,
  });

  const status =
    data?.pm === null || data?.pm === undefined
      ? null
      : getPM25Constant(data.pm);

  const metrics = [
    {
      label: "Temp",
      value: formatNumber(data?.temp ?? null, 2),
      icon: Thermometer,
      unit: "C",
    },
    {
      label: "Humidity",
      value:
        data?.humidity === null || data?.humidity === undefined
          ? "-"
          : data.humidity.toString(),
      icon: Droplets,
      unit: "%",
    },
    {
      label: "Wind Speed",
      value: formatNumber(data?.wind_speed ?? null, 2),
      icon: Wind,
      unit: "m/s",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-muted-foreground hover:bg-black/5"
          aria-label={`Open details for ${type.toLowerCase()} ${id}`}
        >
          <EllipsisVertical className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="top-4 right-4 left-auto translate-x-0 translate-y-0 max-w-95 overflow-hidden rounded-2xl border-0 p-0 shadow-2xl sm:top-6 sm:right-6"
        closeButtonClassName="top-3 right-3 rounded-full bg-white/14 p-1.5 text-white opacity-100 hover:bg-white/20 hover:text-white [&_svg:not([class*='size-'])]:size-6"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Pollution Detail</DialogTitle>
          <DialogDescription>
            PM2.5 and weather summary for the selected day.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex flex-col gap-3 p-4 text-white"
            style={{
              background: `linear-gradient(160deg, ${status?.color ?? "#334155"} 0%, #4338ca 100%)`,
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex flex-none flex-col items-center justify-center rounded-lg bg-white/16 px-3 py-2 text-center backdrop-blur">
                  <p className="text-2xl font-semibold leading-none">
                    {formatNumber(data?.pm ?? null, 0)}
                  </p>
                  <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/80">
                    PM2.5
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-white/75">
                    {data?.date ?? "Loading..."}
                  </p>
                  <p className="mt-1 line-clamp-2 text-base font-semibold">
                    {status?.labelTh ?? "No PM2.5 data"}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-black/10" />

            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-white/80">Type:</span>
                <span className="font-semibold">{type}</span>
              </div>
              <p className="font-semibold">
                {formatNumber(data?.pm ?? null, 2)}{" "}
                <span className="text-white/80">ug/m3</span>
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-white px-4 py-3 text-slate-900">
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading detail...</p>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            {!isLoading && !error && data ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {metrics.map((field) => {
                  const Icon = field.icon;

                  return (
                    <div key={`${id}-${field.label}`} className="min-w-0">
                      <div className="mb-1 flex items-center gap-1.5 text-slate-500">
                        <Icon className="size-4" />
                        <span className="text-[11px] uppercase tracking-[0.16em]">
                          {field.label}
                        </span>
                      </div>
                      <p className="truncate text-sm font-semibold">
                        {field.value}{" "}
                        <span className="text-xs font-normal text-slate-500">
                          {field.unit}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
