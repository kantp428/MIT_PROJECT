import {
  cn,
  formatPM25Range,
  PM25_BANDS,
  type PM25Band,
} from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MapLegendProps {
  items?: PM25Band[];
  className?: string;
}

export default function MapLegend({
  items = PM25_BANDS,
  className,
}: MapLegendProps) {
  return (
    <TooltipProvider>
      <div className={cn("space-y-2 px-1 py-4", className)}>
        <div
          className="grid gap-2 text-center text-sm font-medium text-foreground"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item) => (
            <div key={item.labelTh} className="truncate">
              {item.labelTh}
            </div>
          ))}
        </div>

        <div
          className="grid gap-0 overflow-hidden rounded-full px-1"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item, index) => (
            <Tooltip key={item.labelTh}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "h-5 cursor-default",
                    index === 0 && "rounded-l-full",
                    index === items.length - 1 && "rounded-r-full",
                  )}
                  style={{ backgroundColor: item.color }}
                />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{formatPM25Range(item)}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
