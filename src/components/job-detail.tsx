"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Check,
  Copy,
  ExternalLink,
  Footprints,
  GraduationCap,
  Mail,
  MapPin,
  RotateCw,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Job } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Highlight } from "./highlight";

function Chip({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
      {icon}
      {children}
    </span>
  );
}

export function JobDetailSheet({
  job,
  query,
  saved,
  applied,
  onToggleSave,
  onToggleApplied,
  onOpenChange,
}: {
  job: Job | null;
  query: string;
  saved: boolean;
  applied: boolean;
  onToggleSave: (id: string) => void;
  onToggleApplied: (id: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const mailto = useMemo(() => {
    if (!job?.email) return null;
    const subject = `Application for ${job.title} — ${job.company}`;
    const body = `Hello,\n\nI am writing to apply for the ${job.title} role at ${job.company} (${job.park}).\n\nPlease find my resume attached.\n\nRegards,`;
    return `mailto:${job.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [job]);

  if (!job) return null;

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
      toast({ title: "Email copied", description: email });
    } catch {
      toast({ title: "Couldn't copy", description: email, variant: "destructive" });
    }
  };

  const share = async () => {
    const text = `${job.title} at ${job.company} (${job.park})`;
    try {
      if (navigator.share) {
        await navigator.share({ title: text, text, url: job.link || window.location.href });
      } else {
        await navigator.clipboard.writeText(`${text}\n${job.link}`);
        toast({ title: "Link copied", description: "Share it with anyone" });
      }
    } catch {
      /* user dismissed share sheet — ignore */
    }
  };

  const closedNote =
    "This listing is no longer marked active on the park website. The role may still be open — verify on the original posting before applying.";

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0 sm:rounded-t-2xl",
          isMobile ? "h-[94dvh] max-h-[94dvh] rounded-t-2xl" : "w-full max-w-lg sm:max-w-[520px]",
        )}
      >
        <div className="shrink-0 border-b bg-gradient-to-b from-teal-50/80 to-card px-5 pb-4 pt-2">
          {/* grab handle (mobile) */}
          <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-muted-foreground/25 md:hidden" aria-hidden />
          <SheetHeader className="p-0 text-left">
            <div className="flex items-start gap-3">
              <div
                aria-hidden
                className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-xl bg-teal-100 text-xl font-bold text-teal-700"
              >
                {job.company.replace(/[^A-Za-z0-9]/g, "").charAt(0).toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-lg leading-snug">
                  <Highlight text={job.title} query={query} />
                </SheetTitle>
                <SheetDescription className="mt-0.5 text-[13px]">
                  <Highlight text={job.company} query={query} /> · {job.park}
                </SheetDescription>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => onOpenChange(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </SheetHeader>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.experience ? <Chip icon={<GraduationCap className="h-3.5 w-3.5" aria-hidden />}>{job.experience}</Chip> : null}
            {job.jobType ? <Chip icon={<Briefcase className="h-3.5 w-3.5" aria-hidden />}>{job.jobType}</Chip> : null}
            {job.location ? <Chip icon={<MapPin className="h-3.5 w-3.5" aria-hidden />}>{job.location}</Chip> : null}
            {job.isWalkIn ? (
              <Chip icon={<Footprints className="h-3.5 w-3.5" aria-hidden />}>
                <span className="text-violet-700">Walk-in interview</span>
              </Chip>
            ) : null}
            {job.postedLabel ? (
              <Chip icon={<CalendarDays className="h-3.5 w-3.5" aria-hidden />}>Listed {job.postedLabel}</Chip>
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {/* status note */}
          {job.urgency === "closed" ? (
            <div className="mb-4 rounded-lg border border-muted bg-muted/40 p-3 text-[13px] text-muted-foreground">
              {closedNote}
            </div>
          ) : job.urgency === "ending" ? (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] font-medium text-amber-800">
              ⏳ Listing marked as ending {job.expiryLabel} — apply as soon as possible.
            </div>
          ) : null}

          {/* apply box */}
          <section aria-label="Apply" className="rounded-xl border border-teal-200 bg-teal-50/60 p-4">
            <h4 className="text-[13px] font-semibold uppercase tracking-wide text-teal-800">How to apply</h4>
            {job.email ? (
              <>
                <div className="mt-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-foreground">{job.email}</span>
                  <button
                    type="button"
                    aria-label="Copy email address"
                    onClick={() => copyEmail(job.email)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-teal-700 hover:bg-teal-100"
                  >
                    {copiedEmail ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                  </button>
                </div>
                {job.extraEmails.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
                    <span>Also seen in the listing:</span>
                    {job.extraEmails.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => copyEmail(e)}
                        className="rounded bg-teal-100/70 px-1.5 py-0.5 font-medium text-teal-800 hover:bg-teal-100"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {mailto ? (
                    <Button asChild className="h-11 col-span-2 sm:col-span-1 bg-teal-700 hover:bg-teal-800">
                      <a href={mailto}>
                        <Mail className="mr-1 h-4 w-4" aria-hidden /> Email application
                      </a>
                    </Button>
                  ) : null}
                  <Button asChild variant="outline" className="h-11 border-teal-300 hover:bg-teal-50">
                    <a href={job.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-4 w-4" aria-hidden /> Original posting
                    </a>
                  </Button>
                </div>
              </>
            ) : (
              <p className="mt-2 text-[13px] text-muted-foreground">
                No email in the listing — apply via the original posting.
              </p>
            )}
            <div className="mt-2 flex gap-2">
              <Button
                variant={applied ? "secondary" : "outline"}
                onClick={() => onToggleApplied(job.id)}
                className={cn(
                  "h-10 flex-1 text-[13px]",
                  applied ? "bg-teal-100 text-teal-900 hover:bg-teal-100" : "border-teal-300 hover:bg-teal-50",
                )}
              >
                {applied ? (
                  <>
                    <BadgeCheck className="mr-1 h-4 w-4" aria-hidden /> Applied — tap to undo
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1 h-4 w-4" aria-hidden /> I applied to this
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={share}
                aria-label="Share job"
                className="h-10 w-11 shrink-0 border-teal-300 p-0 hover:bg-teal-50"
              >
                <Share2 className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </section>

          {/* description */}
          <section aria-label="Job description" className="mt-5">
            <h4 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
              Full description
            </h4>
            {job.description ? (
              <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-foreground/90">
                <Highlight text={job.description} query={query} />
              </p>
            ) : job.hasDescription !== false ? (
              <div className="space-y-2 py-2" aria-label="Loading description">
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-3">
                  <RotateCw className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  <span>Loading full description…</span>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p className="text-[13.5px] italic text-muted-foreground">
                No detailed description provided in the original listing.
              </p>
            )}
          </section>

          <Separator className="my-4" />
          <p className="pb-2 text-center text-[11px] text-muted-foreground/70">
            Sourced from {job.park} career page · always verify details on the original posting.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
