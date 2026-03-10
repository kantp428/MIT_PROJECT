"use client";

import MapLegend from "@/components/map/map-legend";
import MapWrapper from "@/components/map/MapWrapper";
import {
  FilterDropdown,
  type FilterOption,
} from "@/components/pollution/filter-dropdown";
import { PollutionTableSection } from "@/components/pollution/pollution-table-section";
import { PM25_BANDS, getPM25Band } from "@/lib/utils";
import { LocationOption } from "@/types/location";
import { Button } from "@/components/ui/button";
import { useLocationOptions } from "@/hooks/use-location-options";
import { usePollutionPredictions } from "@/hooks/use-pollution-predictions";
import * as React from "react";

const STATUS_FILTER_OPTIONS: FilterOption[] = PM25_BANDS.map((band) => ({
  label: band.labelTh,
  value: band.labelTh,
  color: band.color,
}));

const LIMIT_PER_PAGE = 20;

export default function MainPage() {
  const [selectedProvinces, setSelectedProvinces] = React.useState<string[]>(
    [],
  );
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
  const [provinceDropdownOpen, setProvinceDropdownOpen] = React.useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [mounted, setMounted] = React.useState(false);

  const {
    data: predictions,
    pagination,
    isLoading,
    error,
  } = usePollutionPredictions(currentPage, LIMIT_PER_PAGE);
  const { data: provinceOptions } = useLocationOptions();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (pagination && currentPage > pagination.totalPage) {
      setCurrentPage(pagination.totalPage);
    }
  }, [currentPage, pagination]);

  const toggleProvinceSelection = (value: string) => {
    setSelectedProvinces((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const toggleStatusSelection = (value: string) => {
    setSelectedStatuses((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const clearFilters = () => {
    setSelectedProvinces([]);
    setSelectedStatuses([]);
  };

  const mapAirData = React.useMemo(() => {
    return predictions.map((prediction) => ({
      id: prediction.id,
      name: prediction.provinceName,
      province: prediction.provinceName,
      lat: prediction.latitude ?? 0,
      lng: prediction.longitude ?? 0,
      pm25: prediction.PM25 ?? 0,
      lastUpdated: prediction.predicted_at,
    }));
  }, [predictions]);

  const filteredAirData = React.useMemo(() => {
    return mapAirData.filter((item) => {
      const matchesProvince =
        selectedProvinces.length === 0 ||
        selectedProvinces.includes(String(item.id));
      const itemStatus = getPM25Band(item.pm25).labelTh;
      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(itemStatus);

      return matchesProvince && matchesStatus;
    });
  }, [mapAirData, selectedProvinces, selectedStatuses]);

  const provinces = React.useMemo<LocationOption[]>(() => {
    if (provinceOptions.length > 0) {
      return provinceOptions;
    }

    return mapAirData.map((item) => ({
      label: item.province,
      value: String(item.id),
    }));
  }, [mapAirData, provinceOptions]);

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = Boolean(
    pagination && pagination.page < pagination.totalPage,
  );

  const handlePreviousPage = () => {
    if (!hasPreviousPage) {
      return;
    }

    setCurrentPage((page) => Math.max(1, page - 1));
  };

  const handleNextPage = () => {
    if (!hasNextPage) {
      return;
    }

    setCurrentPage((page) => page + 1);
  };

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Air Quality Monitoring</h1>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <FilterDropdown
          mounted={mounted}
          open={provinceDropdownOpen}
          onOpenChange={setProvinceDropdownOpen}
          options={provinces}
          selectedValues={selectedProvinces}
          onToggle={toggleProvinceSelection}
          onClear={() => setSelectedProvinces([])}
          placeholder="เลือกจังหวัด"
          searchPlaceholder="ค้นหาจังหวัด..."
          emptyMessage="ไม่พบจังหวัดที่ค้นหา"
        />
        <FilterDropdown
          mounted={mounted}
          open={statusDropdownOpen}
          onOpenChange={setStatusDropdownOpen}
          options={STATUS_FILTER_OPTIONS}
          selectedValues={selectedStatuses}
          onToggle={toggleStatusSelection}
          onClear={() => setSelectedStatuses([])}
          placeholder="เลือกสถานะฝุ่น"
          searchPlaceholder="ค้นหาสถานะฝุ่น..."
          emptyMessage="ไม่พบสถานะฝุ่นที่ค้นหา"
          className="lg:max-w-xs"
        />
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="lg:self-center"
        >
          ล้างตัวกรอง
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl shadow-lg">
        <MapWrapper airData={filteredAirData} />
      </div>

      <MapLegend />

      <PollutionTableSection
        airData={filteredAirData}
        isLoading={isLoading}
        error={error}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        className="px-0 pb-0"
      />
    </main>
  );
}
