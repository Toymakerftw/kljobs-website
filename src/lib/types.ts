/** Raw job record as produced by the kljob scraping pipeline. */
export interface RawJob {
  id: string;
  company: string;
  role: string;
  deadline: string; // DD-MM-YYYY
  link: string;
  link_canon: string;
  tech_park: string;
  description: string;
  company_profile: string;
  email: string;
  posted_date: string; // DD-MM-YYYY
  location: string;
  job_type: string;
  is_walk_in: boolean;
  job_active: boolean;
  job_expiry: string; // YYYY-MM-DD
  scraped_at: string;
  [key: string]: unknown;
}

export type Urgency = "closed" | "ending" | "new" | "normal";

/** Processed job, derived on the client from RawJob. */
export interface Job {
  id: string;
  title: string;
  company: string;
  park: string;
  description: string;
  email: string;
  extraEmails: string[];
  link: string;
  postedTs: number | null;
  postedLabel: string;
  daysAgo: number | null;
  expiryTs: number | null;
  expiryLabel: string;
  isClosed: boolean;
  isWalkIn: boolean;
  experience: string | null;
  minYears: number | null;
  jobType: string | null;
  location: string | null;
  skills: string[];
  urgency: Urgency;
  searchText: string;
}

export type SortKey = "recent" | "expiring" | "company";
export type TabKey = "all" | "saved" | "applied";

export interface Prefs {
  park: string; // "all" or tech_park value
  sort: SortKey;
  includeExpired: boolean;
  walkInOnly: boolean;
}

export interface CacheData {
  ts: number;
  source: "github" | "snapshot";
  jobs: Job[];
}
