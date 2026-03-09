"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocationOptions } from "@/hooks/use-location-options";
import {
  cn,
  getPM25Band,
  getPM25Constant,
  PM25_BANDS,
  type PM25Band,
} from "@/lib/utils";
import { AirStation } from "@/types/air-quality";
import { LocationOption } from "@/types/location";
import { Check, ChevronsUpDown, CloudBackup } from "lucide-react";
import Link from "next/link";
import * as React from "react";

interface PollutionTableSectionProps {
  airData: AirStation[];
  title?: string;
  className?: string;
  selectedProvinces?: string[];
  onSelectedProvincesChange?: React.Dispatch<React.SetStateAction<string[]>>;
  selectedStatuses?: string[];
  onSelectedStatusesChange?: React.Dispatch<React.SetStateAction<string[]>>;
}

interface FilterOption {
  label: string;
  value: string;
  color?: string;
}

interface MultiSelectFilterProps {
  mounted: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: FilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  clearButtonRightClassName?: string;
  className?: string;
}

function MultiSelectFilter({
  mounted,
  open,
  onOpenChange,
  options,
  selectedValues,
  onToggle,
  onClear,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  clearButtonRightClassName = "right-8",
  className,
}: MultiSelectFilterProps) {
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value),
  );
  const visibleOptions = selectedOptions.slice(0, 2);
  const hiddenCount = selectedOptions.length - visibleOptions.length;

  const triggerContent = (
    <>
      <span className="flex min-w-0 flex-1 items-center overflow-hidden">
        {selectedOptions.length > 0 ? (
          <span className="flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden">
            {visibleOptions.map((option) => (
              <Badge
                key={option.value}
                variant="secondary"
                className="max-w-35 shrink-0 truncate border-transparent text-foreground"
                style={
                  option.color
                    ? {
                        backgroundColor: `${option.color}20`,
                        borderColor: `${option.color}60`,
                        color: option.color,
                      }
                    : undefined
                }
              >
                {option.label}
              </Badge>
            ))}
            {hiddenCount > 0 && (
              <Badge variant="outline" className="shrink-0">
                ...
              </Badge>
            )}
          </span>
        ) : (
          <span className="truncate text-left text-muted-foreground">
            {placeholder}
          </span>
        )}
      </span>
      <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
    </>
  );

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      {mounted ? (
        <Popover open={open} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-auto min-h-9 w-full justify-between bg-background py-1.5 pr-24 font-sans"
            >
              {triggerContent}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
            <Command>
              <CommandInput
                placeholder={searchPlaceholder}
                className="font-sans"
              />
              <CommandList>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = selectedValues.includes(option.value);

                    return (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onSelect={() => onToggle(option.value)}
                        className="font-sans"
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {option.color && (
                          <span
                            className="mr-2 size-2.5 rounded-full"
                            style={{ backgroundColor: option.color }}
                          />
                        )}
                        {option.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : (
        <Button
          variant="outline"
          type="button"
          className="h-auto min-h-9 w-full justify-between bg-background py-1.5 pr-24 font-sans"
        >
          {triggerContent}
        </Button>
      )}
      {selectedOptions.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 text-xs text-muted-foreground transition-colors hover:text-foreground",
            clearButtonRightClassName,
          )}
        >
          Clear all
        </button>
      )}
    </div>
  );
}

export function PollutionTableSection({
  airData,
  title = "Air Quality Index Table",
  className,
  selectedProvinces: controlledSelectedProvinces,
  onSelectedProvincesChange,
  selectedStatuses: controlledSelectedStatuses,
  onSelectedStatusesChange,
}: PollutionTableSectionProps) {
  const [mounted, setMounted] = React.useState(false);
  const [internalSelectedProvinces, setInternalSelectedProvinces] =
    React.useState<string[]>([]);
  const [internalSelectedStatuses, setInternalSelectedStatuses] =
    React.useState<string[]>([]);
  const [provinceDropdownOpen, setProvinceDropdownOpen] = React.useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = React.useState(false);
  const { data: provinceOptions } = useLocationOptions();

  const selectedProvinces =
    controlledSelectedProvinces ?? internalSelectedProvinces;
  const setSelectedProvinces =
    onSelectedProvincesChange ?? setInternalSelectedProvinces;
  const selectedStatuses =
    controlledSelectedStatuses ?? internalSelectedStatuses;
  const setSelectedStatuses =
    onSelectedStatusesChange ?? setInternalSelectedStatuses;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const provinces = React.useMemo<LocationOption[]>(() => {
    if (provinceOptions.length > 0) {
      return provinceOptions;
    }

    return airData.map((item) => ({
      label: item.province,
      value: String(item.id),
    }));
  }, [airData, provinceOptions]);

  const statusOptions = React.useMemo<FilterOption[]>(
    () =>
      PM25_BANDS.map((band: PM25Band) => ({
        label: band.labelTh,
        value: band.labelTh,
        color: band.color,
      })),
    [],
  );

  const toggleProvince = (province: string) => {
    setSelectedProvinces((current) =>
      current.includes(province)
        ? current.filter((item) => item !== province)
        : [...current, province],
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
  };

  const filteredData = airData.filter((item) => {
    const matchesProvince =
      selectedProvinces.length === 0 ||
      selectedProvinces.includes(String(item.id));
    const itemStatus = getPM25Band(item.pm25).labelTh;
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(itemStatus);

    return matchesProvince && matchesStatus;
  });

  return (
    <TooltipProvider>
      <div className={cn("space-y-4 p-6", className)}>
        <h1 className="font-sans text-2xl font-bold tracking-tight">{title}</h1>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
            <MultiSelectFilter
              mounted={mounted}
              open={provinceDropdownOpen}
              onOpenChange={setProvinceDropdownOpen}
              options={provinces}
              selectedValues={selectedProvinces}
              onToggle={toggleProvince}
              onClear={() => setSelectedProvinces([])}
              placeholder="ค้นหาและเลือกจังหวัด"
              searchPlaceholder="ค้นหาจังหวัด..."
              emptyMessage="ไม่พบจังหวัดที่ค้นหา"
            />

            <MultiSelectFilter
              mounted={mounted}
              open={statusDropdownOpen}
              onOpenChange={setStatusDropdownOpen}
              options={statusOptions}
              selectedValues={selectedStatuses}
              onToggle={toggleStatus}
              onClear={() => setSelectedStatuses([])}
              placeholder="เลือกสถานะฝุ่น"
              searchPlaceholder="ค้นหาสถานะฝุ่น..."
              emptyMessage="ไม่พบสถานะฝุ่นที่ค้นหา"
              clearButtonRightClassName="right-9"
              className="max-w-xs"
            />
          </div>
        </div>

        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-25">ID</TableHead>
                <TableHead>จังหวัด</TableHead>
                <TableHead className="text-center">PM2.5 (µg/m³)</TableHead>
                <TableHead className="text-center">อัปเดตล่าสุด</TableHead>
                <TableHead className="text-center">ข้อมูลย้อนหลัง</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">
                      {item.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.province}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="size-3 rounded-full shadow-inner"
                              style={{
                                backgroundColor: getPM25Constant(item.pm25)
                                  .color,
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{getPM25Constant(item.pm25).labelTh}</p>
                          </TooltipContent>
                        </Tooltip>
                        <span className="font-bold">{item.pm25}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {item.lastUpdated}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/map/7-past/${item.id}`}>
                          <CloudBackup />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    ไม่พบข้อมูลที่ค้นหา
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
