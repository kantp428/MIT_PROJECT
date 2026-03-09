import { Button } from "@/components/ui/button";
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
import { cn, getPM25Constant } from "@/lib/utils";
import { AirStation } from "@/types/air-quality";
import { Calendar, CalendarClock, CloudBackup } from "lucide-react";
import Link from "next/link";

interface PaginationControls {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

interface PollutionTableSectionProps extends PaginationControls {
  airData: AirStation[];
  title?: string;
  className?: string;
  isLoading?: boolean;
  error?: string | null;
}

export function PollutionTableSection({
  airData,
  title = "Air Quality Index Table",
  className,
  isLoading = false,
  error = null,
  hasPreviousPage,
  hasNextPage,
  onPreviousPage,
  onNextPage,
}: PollutionTableSectionProps) {
  return (
    <TooltipProvider>
      <div className={cn("space-y-4 p-6", className)}>
        <h1 className="font-sans text-2xl font-bold tracking-tight">{title}</h1>

        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-25">ID</TableHead>
                <TableHead>จังหวัด</TableHead>
                <TableHead className="text-center">PM2.5 (µg/m³)</TableHead>
                <TableHead className="text-center">อัปเดตล่าสุด</TableHead>
                <TableHead className="text-center">รายละเอียด</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-sm text-destructive"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading pollution predictions...
                  </TableCell>
                </TableRow>
              ) : airData.length > 0 ? (
                airData.map((item) => (
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
                        <Link href={`/pollution/detail/${item.id}`}>
                          <CalendarClock />
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
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousPage}
            disabled={!hasPreviousPage}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={!hasNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
