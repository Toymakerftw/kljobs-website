"use client";

import { BadgeCheck, Clock, Footprints, Heart, MapPin } from "lucide-react";
import type { Job } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Highlight } from "./highlight";

const PARK_SHORT: Record<string, string> = {
  "Cyberpark Kozhikode": "Cyberpark",
  "UL Cyberpark": "UL Cyberpark",
  Infopark: "Infopark",
  Technopark: "Technopark",
};

function UrgencyBadge({ job }: { job: Job }) {
  if (job.urgency === "closed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        Closed
      </span>
    );
  }
  if (job.urgency === "ending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
        <Clock className="h-3 w-3" aria-hidden />
        Ends {job.expiryLabel}
      </span>
    );
  }
  if (job.urgency === "new") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-800">
        New
      </span>
    );
  }
  return null;
}

export function JobCard({
  job,
  saved,
  applied,
  query,
  onToggleSave,
  onOpen,
}: {
  job: Job;
  saved: boolean;
  applied: boolean;
  query: string;
  onToggleSave: (id: string) => void;
  onOpen: (job: Job) => void;
}) {
  const initial = job.company.replace(/[^A-Za-z0-9]/g, "").charAt(0).toUpperCase() || "?";

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${job.title} at ${job.company}`}
      onClick={() => onOpen(job)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(job);
        }
      }}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col gap-2.5 rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:border-teal-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-teal-600 active:scale-[0.995]",
        job.urgency === "closed" && "opacity-65",
        applied && "border-l-4 border-l-teal-600",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden
          className="flex h-11 w-11 shrink-0 select-none items-center justify-center rounded-lg bg-teal-50 text-lg font-bold text-teal-700"
        >
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground">
            <Highlight text={job.title} query={query} />
          </h3>
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
            <Highlight text={job.company} query={query} />
            {applied ? (
              <span className="ml-1.5 inline-flex items-center gap-0.5 align-middle text-[12px] font-medium text-teal-700">
                <BadgeCheck className="inline h-3.5 w-3.5" aria-hidden /> Applied
              </span>
            ) : null}
          </p>
        </div>

        <button
          type="button"
          aria-label={saved ? "Remove from saved" : "Save job"}
          aria-pressed={saved}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(job.id);
          }}
          className={cn(
            "-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
            saved ? "text-rose-600" : "text-muted-foreground/50 hover:bg-muted hover:text-rose-500",
          )}
        >
          <Heart className={cn("h-5 w-5", saved && "fill-rose-600")} aria-hidden />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
        <span className="rounded-md bg-teal-50 px-1.5 py-0.5 font-medium text-teal-800">
          {PARK_SHORT[job.park] ?? job.park}
        </span>
        {job.location ? (
          <span className="inline-flex items-center gap-0.5">
            <MapPin className="h-3 w-3" aria-hidden />
            {job.location}
          </span>
        ) : null}
        {job.isWalkIn ? (
          <span className="inline-flex items-center gap-0.5 font-medium text-violet-700">
            <Footprints className="h-3 w-3" aria-hidden /> Walk-in
          </span>
        ) : null}
        {job.daysAgo != null && <span>{job.daysAgo === 0 ? "Today" : job.daysAgo === 1 ? "Yesterday" : `${job.daysAgo}d ago`}</span>}
        <UrgencyBadge job={job} />
      </div>

      {job.skills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded-md border bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              <Highlight text={s} query={query} />
            </span>
          ))}
          {job.skills.length > 4 ? (
            <span className="rounded-md px-1 py-0.5 text-[11px] text-muted-foreground/70">
              +{job.skills.length - 4}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
