"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getPM25Constant } from "@/lib/utils";
import { AirStation } from "@/types/air-quality";
import * as React from "react";

export default function PollutionPage() {
  const [search, setSearch] = React.useState("");
  const [province, setProvince] = React.useState("all");
  const debouncedSearch = useDebounce(search, 500);

  const mockData: AirStation[] = [
    {
      id: 1,
      name: "เขตพญาไท",
      province: "กรุงเทพ",
      lat: 13.78,
      lng: 100.54,
      pm25: 38,
      lastUpdated: "2026-02-16",
    },
    {
      id: 2,
      name: "อ.เมือง เชียงใหม่",
      province: "เชียงใหม่",
      lat: 18.79,
      lng: 98.98,
      pm25: 82,
      lastUpdated: "2026-02-16",
    },
    // เพิ่มข้อมูลจำลองตรงนี้...
  ];

  // Logic: Filtering ข้อมูล
  const filteredData = mockData.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase());
    const matchesProvince =
      province === "all" || item.province.includes(province);
    return matchesSearch && matchesProvince;
  });

  return (
    <div className="space-y-4 p-6">
      <h1 className="font-sans text-2xl font-bold tracking-tight">
        Air Quality Index Table
      </h1>

      {/* --- Filters Section --- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="ค้นหาชื่อตำบล/เขต..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Select value={province} onValueChange={setProvince}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="เลือกจังหวัด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="กรุงเทพ">กรุงเทพ</SelectItem>
            <SelectItem value="เชียงใหม่">เชียงใหม่</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* --- Table Section --- */}
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
                  <TableCell className="text-muted-foreground text-sm">
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

      {/* --- Pagination (Simple) --- */}
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
