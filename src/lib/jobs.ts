import type { CacheData, Job, RawJob } from "./types";

/** Primary: raw githubusercontent (serves CORS *). Secondary: github.com redirect. Fallback: bundled snapshot. */
export const DATA_URLS = [
  "https://raw.githubusercontent.com/Toymakerftw/kljob/main/data/jobs.json",
  "https://github.com/Toymakerftw/kljob/raw/refs/heads/main/data/jobs.json",
  "/jobs-snapshot.json",
] as const;

export const CACHE_KEY = "kljobs:v1:cache";

/* ------------------------------------------------------------------ */
/* Date helpers                                                        */
/* ------------------------------------------------------------------ */

function parseDMY(s: string | undefined): number | null {
  if (!s) return null;
  const m = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return isNaN(d.getTime()) ? null : d.getTime();
}

function parseISO(s: string | undefined): number | null {
  if (!s) return null;
  const d = new Date(s + (s.length === 10 ? "T00:00:00" : ""));
  return isNaN(d.getTime()) ? null : d.getTime();
}

const DAY = 86_400_000;

export function startOfToday(): number {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
}

function fmt(ts: number | null): string {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function timeAgo(ts: number): string {
  const s = Math.max(0, Date.now() - ts) / 1000;
  if (s < 90) return "just now";
  const m = s / 60;
  if (m < 60) return `${Math.floor(m)} min ago`;
  const h = m / 60;
  if (h < 24) return `${Math.floor(h)} hr ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export function daysAgoLabel(ts: number | null): string {
  if (ts == null) return "";
  const d = Math.floor((startOfToday() - new Date(new Date(ts).getFullYear(), new Date(ts).getMonth(), new Date(ts).getDate()).getTime()) / DAY);
  if (d <= 0) return "Posted today";
  if (d === 1) return "Posted yesterday";
  return `Posted ${d}d ago`;
}

/* ------------------------------------------------------------------ */
/* Field derivation                                                    */
/* ------------------------------------------------------------------ */

/** Infopark listings repeat the company in `role`; the real title is line 1 of the description. */
function deriveTitle(raw: RawJob): string {
  const role = (raw.role ?? "").trim();
  const company = (raw.company ?? "").trim();
  if (role && role.toLowerCase() !== company.toLowerCase()) return role;

  const lines = (raw.description ?? "").split("\n");
  for (const l of lines.slice(0, 4)) {
    let t = l.trim();
    if (!t) continue;
    const m = /^job\s*title\s*[:\-]\s*(.+)$/i.exec(t);
    if (m) t = m[1].trim();
    if (t.length > 1 && !/^about (the )?company/i.test(t)) return t.slice(0, 120);
  }
  return role || company || "Untitled role";
}

function deriveExperience(desc: string): { label: string; min: number | null } | null {
  const fresher = /\bfresher\b|fresh graduates?|entry[- ]level|0\s*[-–to]+\s*[12]\s*(?:years?|yrs?)/i.test(desc);
  const range = /(\d{1,2})\s*(?:-|–|—|to)\s*(\d{1,2})\s*\+?\s*(?:years?|yrs?)/i.exec(desc);
  if (range) {
    let a = Number(range[1]);
    let b = Number(range[2]);
    if (a > b) [a, b] = [b, a];
    if (b <= 40) return { label: `${a}–${b} yrs`, min: a };
  }
  const plus = /(\d{1,2})\s*\+?\s*(?:years?|yrs?)(?!.{0,20}(?:pass|degree|diploma))/i.exec(desc);
  if (plus) {
    const n = Number(plus[1]);
    if (n <= 40) return { label: `${n}+ yrs`, min: n };
  }
  if (fresher) return { label: "Fresher friendly", min: 0 };
  return null;
}

const TYPE_RULES: Array<[RegExp, string]> = [
  [/intern(ship)?/i, "Internship"],
  [/part[- ]time/i, "Part time"],
  [/\bcontract(ual)?\b|\bfreelance\b/i, "Contract"],
  [/hybrid/i, "Hybrid"],
  [/\bremote\b|work from home|\bwfh\b/i, "Remote"],
  [/\bonsite\b|on[- ]site|work from office|\bwfo\b/i, "Onsite"],
];

function deriveJobType(raw: RawJob, desc: string): string | null {
  if (raw.job_type && raw.job_type.trim()) return raw.job_type.trim();
  for (const [re, label] of TYPE_RULES) if (re.test(desc)) return label;
  return null;
}

const PARK_LOCATION: Record<string, string> = {
  Technopark: "Thiruvananthapuram",
  Infopark: "Kochi",
  "Cyberpark Kozhikode": "Kozhikode",
  "UL Cyberpark": "Kozhikode",
};

function deriveLocation(raw: RawJob, desc: string): string | null {
  if (raw.location && raw.location.trim()) return raw.location.trim();
  if (/kakkanad/i.test(desc)) return "Kakkanad, Kochi";
  if (/thiruvananthapuram|trivandrum/i.test(desc)) return "Thiruvananthapuram";
  if (/\bkozhikode\b|calicut/i.test(desc)) return "Kozhikode";
  if (/\bkochi\b|ernakulam|cochin/i.test(desc)) return "Kochi";
  return PARK_LOCATION[raw.tech_park] ?? null;
}

/** Ordered, most-specific first. */
const SKILLS: Array<[string, RegExp]> = [
  ["React Native", /react native/i],
  ["React", /\breact\b/i],
  ["Next.js", /next\.?js/i],
  ["Angular", /angular/i],
  ["Vue.js", /vue\.?js|\bvue\b/i],
  ["Node.js", /node\.?js/i],
  ["TypeScript", /typescript/i],
  ["JavaScript", /javascript/i],
  ["Python", /\bpython\b/i],
  ["Java", /\bjava\b/i],
  ["Kotlin", /\bkotlin\b/i],
  ["Swift", /\bswift\b/i],
  ["Flutter", /flutter/i],
  ["Go", /\bgolang\b/i],
  ["PHP", /\bphp\b/i],
  ["Laravel", /laravel/i],
  ["Django", /django/i],
  ["Spring", /spring( boot)?/i],
  ["C#", /\bc#\b/i],
  ["C++", /\bc\+\+/i],
  [".NET", /\.net\b/i],
  ["SQL", /\bsql\b/i],
  ["MySQL", /mysql/i],
  ["PostgreSQL", /postgres/i],
  ["MongoDB", /mongo(?:db)?/i],
  ["BigQuery", /bigquery/i],
  ["Redis", /\bredis\b/i],
  ["AWS", /\baws\b|amazon web services/i],
  ["Azure", /\bazure\b/i],
  ["GCP", /\bgcp\b|google cloud/i],
  ["Docker", /docker/i],
  ["Kubernetes", /kubernetes|\bk8s\b/i],
  ["Terraform", /terraform/i],
  ["Ansible", /ansible/i],
  ["Jenkins", /jenkins/i],
  ["GitHub Actions", /github actions/i],
  ["Azure DevOps", /azure devops/i],
  ["CI/CD", /\bci\/cd\b/i],
  ["Linux", /\blinux\b/i],
  ["Bash", /\bbash\b|shell scripting/i],
  ["Figma", /\bfigma\b/i],
  ["Power BI", /power\s*bi/i],
  ["Looker", /looker/i],
  ["Tableau", /tableau/i],
  ["Selenium", /selenium/i],
  ["Playwright", /playwright/i],
  ["Cypress", /cypress/i],
  ["GraphQL", /graphql/i],
  ["REST APIs", /rest(?:ful)?\s+apis?\b/i],
  ["Kafka", /\bkafka\b/i],
  ["Spark", /\bspark\b/i],
  ["Airflow", /airflow/i],
  ["Machine Learning", /machine learning|\bml\b/i],
  ["LLMs", /\bllm?s\b|large language/i],
  ["DevOps", /devops/i],
  ["Salesforce", /salesforce/i],
  ["HubSpot", /hubspot/i],
  ["Zoho", /\bzoho\b/i],
  ["SEO", /\bseo\b/i],
  ["Photoshop", /photoshop/i],
  ["Illustrator", /illustrator/i],
  ["Premiere Pro", /premiere/i],
  ["After Effects", /after effects/i],
  ["WordPress", /wordpress/i],
  ["Tailwind CSS", /tailwind/i],
  ["Networking", /\bnetworking\b|firewall/i],
];

function deriveSkills(desc: string): string[] {
  const out: string[] = [];
  for (const [name, re] of SKILLS) {
    if (re.test(desc)) {
      out.push(name);
      if (out.length >= 8) break;
    }
  }
  return out;
}

function extractEmails(desc: string): string[] {
  const set = new Set<string>();
  const re = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
  const found = desc.match(re);
  if (found) for (const e of found) set.add(e.toLowerCase());
  return [...set];
}

/* ------------------------------------------------------------------ */
/* Raw -> Job                                                          */
/* ------------------------------------------------------------------ */

export function processJob(raw: RawJob, today: number): Job {
  const desc = raw.description ?? "";
  const company = (raw.company ?? "").trim() || "Unknown company";
  const title = deriveTitle(raw);
  const email = (raw.email ?? "").trim();

  const postedTs = parseDMY(raw.posted_date) ?? parseISO(raw.scraped_at);
  const expiryTs = parseISO(raw.job_expiry);
  const isClosed = raw.job_active === false;
  const postedDay = postedTs != null ? new Date(postedTs).setHours(0, 0, 0, 0) : null;
  const daysAgo = postedDay != null ? Math.floor((today - postedDay) / DAY) : null;

  let urgency: Job["urgency"] = "normal";
  if (isClosed) urgency = "closed";
  else if (expiryTs != null && expiryTs >= today && expiryTs - today <= 2 * DAY) urgency = "ending";
  else if (daysAgo != null && daysAgo <= 2) urgency = "new";

  const listed = new Set<string>([email.toLowerCase()].filter(Boolean));
  const extraEmails = extractEmails(desc).filter((e) => !listed.has(e)).slice(0, 2);

  const skills = deriveSkills(desc);
  const exp = deriveExperience(desc);
  const jobType = deriveJobType(raw, desc);
  const location = deriveLocation(raw, desc);

  const searchText = [title, company, raw.tech_park, desc, skills.join(" "), location ?? "", jobType ?? ""]
    .join(" \n ")
    .toLowerCase();

  return {
    id: raw.id,
    title,
    company,
    park: raw.tech_park || "Other",
    description: desc,
    email,
    extraEmails,
    link: raw.link_canon || raw.link || "",
    postedTs,
    postedLabel: fmt(postedTs),
    daysAgo,
    expiryTs,
    expiryLabel: fmt(expiryTs),
    isClosed,
    isWalkIn: raw.is_walk_in === true,
    experience: exp?.label ?? null,
    minYears: exp?.min ?? null,
    jobType,
    location,
    skills,
    urgency,
    searchText,
  };
}

export function processJobs(raw: RawJob[]): Job[] {
  const today = startOfToday();
  return raw.filter((j) => j && j.id).map((j) => processJob(j, today));
}

/* ------------------------------------------------------------------ */
/* Fetch + cache (stale-while-revalidate)                              */
/* ------------------------------------------------------------------ */

export function readCache(): CacheData | null {
  if (typeof window === "undefined") return null;
  try {
    const s = window.localStorage.getItem(CACHE_KEY);
    if (!s) return null;
    const parsed = JSON.parse(s) as CacheData;
    if (!parsed || !Array.isArray(parsed.jobs) || parsed.jobs.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCache(data: CacheData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Quota exceeded — drop the oldest entry style: retry without descriptions is not worth it; skip caching.
  }
}

export function clearCache(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

async function fetchWithTimeout(url: string, ms = 15000): Promise<RawJob[]> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Unexpected payload");
    return data as RawJob[];
  } finally {
    clearTimeout(t);
  }
}

/** Try every URL in order; return { jobs, source } of the first that works. */
export async function fetchJobs(): Promise<{ jobs: Job[]; source: "github" | "snapshot" }> {
  for (let i = 0; i < DATA_URLS.length; i++) {
    const url = DATA_URLS[i];
    try {
      const raw = await fetchWithTimeout(url);
      if (raw.length === 0) throw new Error("Empty dataset");
      return { jobs: processJobs(raw), source: i < 2 ? "github" : "snapshot" };
    } catch {
      // try next source
    }
  }
  throw new Error("All data sources failed");
}

export interface FetchProgressiveMeta {
  source: "github" | "snapshot" | "edge";
  ts: number;
}

let fullSyncPromise: Promise<{ jobs: Job[]; source: "github" | "snapshot" }> | null = null;

export function triggerFullSync(): Promise<{ jobs: Job[]; source: "github" | "snapshot" }> {
  if (!fullSyncPromise) {
    fullSyncPromise = fetchJobs()
      .then((res) => {
        writeCache({ ts: Date.now(), source: res.source, jobs: res.jobs });
        return res;
      })
      .catch((err) => {
        fullSyncPromise = null; // allow retry on failure
        throw err;
      });
  }
  return fullSyncPromise;
}

export function resetFullSync(): void {
  fullSyncPromise = null;
}

/**
 * Phase 1: Fast edge load (~25 KB) for instant first paint
 * Phase 2: Background full sync from GitHub Raw for descriptions & offline cache
 */
export async function fetchJobsProgressive(
  onInitialSummary: (jobs: Job[], meta?: FetchProgressiveMeta) => void,
  onFullLoaded: (jobs: Job[], meta?: FetchProgressiveMeta) => void
): Promise<void> {
  let initialRendered = false;

  // 1. Try local storage cache first
  const localCache = readCache();
  if (localCache) {
    onInitialSummary(localCache.jobs, { source: localCache.source, ts: localCache.ts });
    initialRendered = true;
  }

  // 2. Fetch fast Edge-cached summary if no local cache or stale
  if (!localCache) {
    try {
      const edgeRes = await fetch("/api/jobs", { cache: "default" });
      if (edgeRes.ok) {
        const data = await edgeRes.json();
        if (data.jobs?.length) {
          onInitialSummary(data.jobs, { source: "edge", ts: data.ts || Date.now() });
          initialRendered = true;
        }
      }
    } catch {
      // Fallback to direct snapshot if edge fails
    }
  }

  // 3. Defer full payload sync to browser idle time (or immediately if initial summary failed)
  const runSync = async () => {
    try {
      const { jobs, source } = await triggerFullSync();
      onFullLoaded(jobs, { source, ts: Date.now() });
    } catch (err) {
      if (!initialRendered) {
        throw err;
      }
      // Ignore background sync errors if initial render already succeeded
    }
  };

  if (!initialRendered) {
    // If neither local cache nor edge summary worked, sync immediately without deferring
    await runSync();
  } else {
    const scheduleSync =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? window.requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 1000);

    scheduleSync(() => {
      runSync().catch(() => {});
    });
  }
}

