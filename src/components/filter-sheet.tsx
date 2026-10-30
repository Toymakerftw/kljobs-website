"use client";

import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Prefs, SortKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const SORTS: Array<{ value: SortKey; label: string; hint: string }> = [
  { value: "recent", label: "Newest first", hint: "Latest listings from the parks" },
  { value: "expiring", label: "Expiring soon", hint: "Closing listings at the top" },
  { value: "company", label: "Company A–Z", hint: "Browse alphabetically" },
];

export function FilterSheet({
  open,
  onOpenChange,
  prefs,
  update,
  onReset,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  prefs: Prefs;
  update: (p: Partial<Prefs>) => void;
  onReset: () => void;
}) {
  const isMobile = useIsMobile();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn("flex flex-col gap-0 overflow-hidden p-0", isMobile ? "h-auto max-h-[85dvh] rounded-t-2xl" : "w-full max-w-sm sm:max-w-[400px]")}
      >
        <div className="shrink-0 border-b px-5 pb-4 pt-2">
          <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-muted-foreground/25 md:hidden" aria-hidden />
          <SheetHeader className="p-0 text-left">
            <SheetTitle className="flex items-center gap-2 text-base">
              <SlidersHorizontal className="h-4 w-4" aria-hidden /> More filters
            </SheetTitle>
            <SheetDescription className="text-[13px]">Sorting and visibility options</SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <fieldset>
            <legend className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Sort by</legend>
            <RadioGroup value={prefs.sort} onValueChange={(v) => update({ sort: v as SortKey })} className="mt-2 gap-2">
              {SORTS.map((s) => (
                <Label
                  key={s.value}
                  htmlFor={`sort-${s.value}`}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                    prefs.sort === s.value ? "border-teal-600 bg-teal-50" : "hover:bg-muted/50",
                  )}
                >
                  <RadioGroupItem value={s.value} id={`sort-${s.value}`} className="mt-0.5" />
                  <span className="grid gap-0.5">
                    <span className="text-[14px] font-medium leading-none">{s.label}</span>
                    <span className="text-[12px] text-muted-foreground">{s.hint}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
              <div className="grid gap-0.5">
                <span className="text-[14px] font-medium leading-none">Include closed jobs</span>
                <span className="text-[12px] text-muted-foreground">Listings removed from park sites</span>
              </div>
              <Switch checked={prefs.includeExpired} onCheckedChange={(v) => update({ includeExpired: v })} aria-label="Include closed jobs" />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
              <div className="grid gap-0.5">
                <span className="text-[14px] font-medium leading-none">Walk-in interviews only</span>
                <span className="text-[12px] text-muted-foreground">Direct walk-in hiring drives</span>
              </div>
              <Switch checked={prefs.walkInOnly} onCheckedChange={(v) => update({ walkInOnly: v })} aria-label="Walk-in interviews only" />
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-lg py-2.5 text-center text-[13px] font-medium text-teal-700 hover:bg-teal-50"
          >
            Reset all filters
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
