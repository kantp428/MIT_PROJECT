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
import { Input } from "@/components/ui/input";
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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDebounce } from "@/hooks/use-debounce";
import { cn, getPM25Constant } from "@/lib/utils";
import { AirStation } from "@/types/air-quality";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

interface PollutionTableSectionProps {
  airData: AirStation[];
  title?: string;
  className?: string;
}

export function PollutionTableSection({
  airData,
  title = "Air Quality Index Table",
  className,
}: PollutionTableSectionProps) {
  const [mounted, setMounted] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedProvinces, setSelectedProvinces] = React.useState<string[]>(
    [],
  );
  const [provinceDropdownOpen, setProvinceDropdownOpen] = React.useState(false);
  const debouncedSearch = useDebounce(search, 500);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const provinces = React.useMemo(() => {
    return Array.from(new Set(airData.map((item) => item.province))).map(
      (province) => ({
        label: province,
        value: province,
      }),
    );
  }, [airData]);

  const selectedProvinceLabels = provinces.filter((province) =>
    selectedProvinces.includes(province.value),
  );
  const visibleProvinceLabels = selectedProvinceLabels.slice(0, 2);
  const hiddenProvinceCount =
    selectedProvinceLabels.length - visibleProvinceLabels.length;

  const toggleProvince = (province: string) => {
    setSelectedProvinces((current) =>
      current.includes(province)
        ? current.filter((item) => item !== province)
        : [...current, province],
    );
  };

  const clearAllProvinces = () => {
    setSelectedProvinces([]);
  };

  const filteredData = airData.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase());
    const matchesProvince =
      selectedProvinces.length === 0 ||
      selectedProvinces.includes(item.province);

    return matchesSearch && matchesProvince;
  });

  const triggerContent = (
    <>
      <span className="flex min-w-0 flex-1 items-center overflow-hidden">
        {selectedProvinceLabels.length > 0 ? (
          <span className="flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden">
            {visibleProvinceLabels.map((province) => (
              <Badge
                key={province.value}
                variant="secondary"
                className="max-w-35 shrink-0 truncate"
              >
                {province.label}
              </Badge>
            ))}
            {hiddenProvinceCount > 0 && (
              <Badge variant="outline" className="shrink-0">
                ...
              </Badge>
            )}
          </span>
        ) : (
          <span className="truncate text-left text-muted-foreground">
            ค้นหาและเลือกจังหวัด
          </span>
        )}
      </span>
      <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
    </>
  );

  return (
    <div className={cn("space-y-4 p-6", className)}>
      <h1 className="font-sans text-2xl font-bold tracking-tight">{title}</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex-1">
          <Input
            placeholder="ค้นหาชื่อตำบล/เขต..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="relative w-full max-w-md">
          {mounted ? (
            <Popover
              open={provinceDropdownOpen}
              onOpenChange={setProvinceDropdownOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={provinceDropdownOpen}
                  className="h-auto min-h-9 w-full justify-between bg-background py-1.5 pr-24 font-sans"
                >
                  {triggerContent}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput
                    placeholder="ค้นหาจังหวัด..."
                    className="font-sans"
                  />
                  <CommandList>
                    <CommandEmpty>ไม่พบจังหวัดที่ค้นหา</CommandEmpty>
                    <CommandGroup>
                      {provinces.map((province) => {
                        const isSelected = selectedProvinces.includes(
                          province.value,
                        );

                        return (
                          <CommandItem
                            key={province.value}
                            value={province.label}
                            onSelect={() => toggleProvince(province.value)}
                            className="font-sans"
                          >
                            <Check
                              className={cn(
                                "mr-2 size-4",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {province.label}
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
          {selectedProvinceLabels.length > 0 && (
            <button
              type="button"
              onClick={clearAllProvinces}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-25">ID</TableHead>
              <TableHead>พื้นที่</TableHead>
              <TableHead>จังหวัด</TableHead>
              <TableHead className="text-center">PM2.5 (µg/m³)</TableHead>
              <TableHead>อัปเดตล่าสุด</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="font-medium">{item.province}</TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger>
                          <div
                            className="size-3 rounded-full shadow-inner"
                            style={{
                              backgroundColor: getPM25Constant(item.pm25).color,
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
                  <TableCell className="text-sm text-muted-foreground">
                    {item.lastUpdated}
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
  );
}

