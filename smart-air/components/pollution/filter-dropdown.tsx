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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

export interface FilterOption {
  label: string;
  value: string;
  color?: string;
}

interface FilterDropdownProps {
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

export function FilterDropdown({
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
}: FilterDropdownProps) {
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
