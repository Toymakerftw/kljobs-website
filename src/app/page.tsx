"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Heart,
  Inbox,
  RotateCw,
  Search,
  SlidersHorizontal,
  WifiOff,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "@/components/job-card";
import { JobDetailSheet } from "@/components/job-detail";
import { FilterSheet } from "@/components/filter-sheet";
import { useToast } from "@/hooks/use-toast";
import {
  DATA_URLS,
  fetchJobs,
  readCache,
  timeAgo,
  writeCache,
} from "@/lib/jobs";
import { DEFAULT_PREFS, useAppliedJobs, useDebounced, useHydrated, usePrefs, useSavedJobs } from "@/lib/storage";
import type { Job, TabKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const PARK_LABEL: Record<string, string> = {
  "Cyberpark Kozhikode": "Cyberpark",
  "UL Cyberpark": "UL Cyberpark",
  Infopark: "Infopark",
  Technopark: "Technopark",
};

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "saved", label: "Saved" },
  { key: "applied", label: "Applied" },
];

export default function Home() {
  const { toast } = useToast();

  /* ---------------- data ---------------- */
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [source, setSource] = useState<"github" | "snapshot" | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tick, setTick] = useState(0); // re-render "updated X ago" every minute

  const load = useCallback(async (isInitial: boolean) => {
    setRefreshing(true);
    try {
      const { jobs: fresh, source: src } = await fetchJobs();
      setJobs(fresh);
      setSource(src);
      setLastUpdated(Date.now());
      setFailed(false);
      writeCache({ ts: Date.now(), source: src, jobs: fresh });
    } catch {
      if (isInitial) setFailed(true);
      else toast({ title: "Couldn't refresh", description: "Showing the last saved copy.", variant: "destructive" });
    } finally {
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setJobs(cached.jobs);
      setSource(cached.source);
      setLastUpdated(cached.ts);
      load(false);
    } else {
      load(true);
    }
    const t = setInterval(() => setTick((x) => x + 1), 60_000);
    return () => clearInterval(t);
  }, [load]);

  /* ---------------- user state (browser storage) ---------------- */
  const [savedIds, toggleSaved] = useSavedJobs();
  const [appliedMap, toggleApplied] = useAppliedJobs();
  const hydrated = useHydrated();

  /* ---------------- filters ---------------- */
  const [prefs, updatePrefs] = usePrefs();
  const [query, setQuery] = useState("");
  const dq = useDebounced(query, 250);
  const [tab, setTab] = useState<TabKey>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);
  const appliedSet = useMemo(() => new Set(Object.keys(appliedMap)), [appliedMap]);

  const parks = useMemo(() => {
    if (!jobs) return [];
    const counts = new Map<string, number>();
    for (const j of jobs) {
      if (j.isClosed) continue;
      counts.set(j.park, (counts.get(j.park) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  const filtered = useMemo(() => {
    if (!jobs) return [];
    const q = dq.trim().toLowerCase();
    return jobs.filter((j) => {
      if (!prefs.includeExpired && j.isClosed) return false;
      if (prefs.walkInOnly && !j.isWalkIn) return false;
      if (prefs.park !== "all" && j.park !== prefs.park) return false;
      if (tab === "saved" && !savedSet.has(j.id)) return false;
      if (tab === "applied" && !appliedSet.has(j.id)) return false;
      if (q && !j.searchText.includes(q)) return false;
      return true;
    });
  }, [jobs, dq, prefs, tab, savedSet, appliedSet]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (prefs.sort) {
      case "expiring":
        arr.sort((a, b) => {
          const ac = a.isClosed ? 1 : 0;
          const bc = b.isClosed ? 1 : 0;
          if (ac !== bc) return ac - bc;
          const ae = a.expiryTs ?? Infinity;
          const be = b.expiryTs ?? Infinity;
          if (ae !== be) return ae - be;
          return (b.postedTs ?? 0) - (a.postedTs ?? 0);
        });
        break;
      case "company":
        arr.sort((a, b) => a.company.localeCompare(b.company) || a.title.localeCompare(b.title));
        break;
      default:
        arr.sort((a, b) => (b.postedTs ?? 0) - (a.postedTs ?? 0));
    }
    return arr;
  }, [filtered, prefs.sort]);

  const counts = useMemo(() => {
    if (!jobs) return { all: 0, saved: 0, applied: 0 };
    return {
      all: jobs.filter((j) => !j.isClosed).length,
      saved: jobs.filter((j) => savedSet.has(j.id)).length,
      applied: jobs.filter((j) => appliedSet.has(j.id)).length,
    };
  }, [jobs, savedSet, appliedSet]);

  const activeFilterCount =
    (prefs.park !== "all" ? 1 : 0) + (prefs.includeExpired ? 1 : 0) + (prefs.walkInOnly ? 1 : 0) + (prefs.sort !== "recent" ? 1 : 0);

  const selectedJob = useMemo(() => (selectedId && jobs ? jobs.find((j) => j.id === selectedId) ?? null : null), [selectedId, jobs]);

  const hasAnyFilter = query.trim() !== "" || prefs.park !== "all" || prefs.includeExpired || prefs.walkInOnly || prefs.sort !== DEFAULT_PREFS.sort;

  const resetAll = () => {
    setQuery("");
    updatePrefs({ park: "all", includeExpired: false, walkInOnly: false, sort: "recent" });
  };

  /* ---------------- render ---------------- */

  const listContent = () => {
    if (!jobs) {
      return (
        <div className="space-y-2.5" aria-label="Loading jobs">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4">
              <div className="flex gap-3">
                <Skeleton className="h-11 w-11 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (failed && jobs.length === 0) {
      return (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <WifiOff className="h-6 w-6 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <p className="font-semibold">Couldn't load the job feed</p>
            <p className="mt-1 text-[13px] text-muted-foreground">Check your connection — data comes from GitHub.</p>
          </div>
          <Button onClick={() => load(true)} className="bg-teal-700 hover:bg-teal-800">
            <RotateCw className="mr-1 h-4 w-4" aria-hidden /> Try again
          </Button>
        </div>
      );
    }

    if (sorted.length === 0) {
      return (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            {tab === "saved" ? (
              <Heart className="h-6 w-6 text-muted-foreground" aria-hidden />
            ) : tab === "applied" ? (
              <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden />
            ) : (
              <Search className="h-6 w-6 text-muted-foreground" aria-hidden />
            )}
          </div>
          <div>
            <p className="font-semibold">
              {tab === "saved" ? "No saved jobs yet" : tab === "applied" ? "Nothing marked as applied" : "No jobs match"}
            </p>
            <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
              {tab === "saved"
                ? "Tap the heart on any job to keep it here for later."
                : tab === "applied"
                  ? "Track what you've applied to from a job's detail view."
                  : hasAnyFilter
                    ? "Try different keywords or clear your filters."
                    : "No open listings right now — check back soon."}
            </p>
          </div>
          {tab === "all" && hasAnyFilter ? (
            <Button variant="outline" onClick={resetAll}>
              Clear search & filters
            </Button>
          ) : null}
        </div>
      );
    }

    return (
      <>
        <p className="px-1 pb-2 pt-1 text-[12px] text-muted-foreground" aria-live="polite">
          {sorted.length} {sorted.length === 1 ? "job" : "jobs"}
          {prefs.park !== "all" ? ` · ${PARK_LABEL[prefs.park] ?? prefs.park}` : ""}
          {lastUpdated ? ` · updated ${timeAgo(lastUpdated)}` : ""}
        </p>
        <div className="space-y-2.5">
          {sorted.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved={savedSet.has(job.id)}
              applied={appliedSet.has(job.id)}
              query={dq}
              onToggleSave={toggleSaved}
              onOpen={(j) => setSelectedId(j.id)}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* sticky control block */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-4">
          {/* brand row */}
          <div className="flex items-center justify-between gap-2 pb-1.5 pt-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-[15px] font-bold leading-tight">Kerala Tech Park Jobs</h1>
                <p className="truncate text-[11px] text-muted-foreground">
                  {jobs && !failed ? `${counts.all} open · Technopark · Infopark · Cyberpark` : "Official park career feeds"}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Refresh job data"
              onClick={() => load(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RotateCw className={cn("h-4.5 w-4.5", refreshing && "animate-spin")} aria-hidden />
            </button>
          </div>

          {/* search */}
          <div className="relative pb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              inputMode="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search role, skill, or company…"
              aria-label="Search jobs"
              className="h-11 rounded-xl border-border bg-card pl-9 pr-9 text-[15px] shadow-sm focus-visible:ring-teal-600"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </div>

          {/* tabs + filters */}
          <div className="flex items-center gap-2 pb-2">
            <div role="tablist" aria-label="Job lists" className="flex flex-1 gap-1 rounded-xl bg-muted p-1">
              {TABS.map((t) => {
                const n = counts[t.key];
                return (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={tab === t.key}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-[13px] transition-all",
                      tab === t.key
                        ? "bg-card font-semibold text-teal-800 shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t.label}
                    {hydrated && n > 0 ? (
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-[11px] font-semibold",
                          tab === t.key ? "bg-teal-100 text-teal-800" : "bg-muted-foreground/10 text-muted-foreground",
                        )}
                      >
                        {n}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              aria-label="More filters"
              onClick={() => setFilterOpen(true)}
              className={cn(
                "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
                activeFilterCount > 0 ? "border-teal-600 bg-teal-50 text-teal-800" : "bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              <SlidersHorizontal className="h-4.5 w-4.5" aria-hidden />
              {activeFilterCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-700 px-1 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
          </div>

          {/* park chips */}
          <div className="no-scrollbar -mx-3 flex gap-1.5 overflow-x-auto px-3 pb-2.5 sm:-mx-4 sm:px-4" role="group" aria-label="Filter by tech park">
            <button
              type="button"
              aria-pressed={prefs.park === "all"}
              onClick={() => updatePrefs({ park: "all" })}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                prefs.park === "all"
                  ? "border-teal-700 bg-teal-700 text-white"
                  : "border-border bg-card text-muted-foreground hover:border-teal-300 hover:text-foreground",
              )}
            >
              All parks
            </button>
            {parks.map(([park, n]) => (
              <button
                key={park}
                type="button"
                aria-pressed={prefs.park === park}
                onClick={() => updatePrefs({ park: prefs.park === park ? "all" : park })}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  prefs.park === park
                    ? "border-teal-700 bg-teal-700 text-white"
                    : "border-border bg-card text-muted-foreground hover:border-teal-300 hover:text-foreground",
                )}
              >
                {PARK_LABEL[park] ?? park} <span className={cn("ml-0.5", prefs.park === park ? "text-teal-100" : "text-muted-foreground/60")}>{n}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* snapshot fallback notice */}
      {source === "snapshot" ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-[12.5px] font-medium text-amber-800">
          Live GitHub feed unreachable — showing a bundled snapshot. Tap ↻ to retry.
        </div>
      ) : null}

      {/* list */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-3 pb-10 pt-3 sm:px-4">{listContent()}</main>

      {/* footer */}
      <footer className="mt-auto border-t bg-card pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto max-w-3xl px-4 text-center text-[11.5px] leading-relaxed text-muted-foreground">
          Listings aggregated from the official career pages of Technopark, Infopark, Cyberpark &amp; UL Cyberpark via{" "}
          <a
            href={DATA_URLS[1].replace("/raw/refs/heads/main/data/", "/blob/main/data/")}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-teal-700 hover:underline"
          >
            github.com/Toymakerftw/kljob
          </a>
          . Saved jobs and applications are stored only in your browser.
        </div>
      </footer>

      {/* sheets */}
      {selectedJob ? (
        <JobDetailSheet
          job={selectedJob}
          query={dq}
          saved={savedSet.has(selectedJob.id)}
          applied={appliedSet.has(selectedJob.id)}
          onToggleSave={toggleSaved}
          onToggleApplied={toggleApplied}
          onOpenChange={(open) => {
            if (!open) setSelectedId(null);
          }}
        />
      ) : null}
      <FilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        prefs={prefs}
        update={updatePrefs}
        onReset={() => {
          resetAll();
          setFilterOpen(false);
        }}
      />
    </div>
  );
}
