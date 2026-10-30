import { NextResponse } from "next/server";
import { processJobs } from "@/lib/jobs";
import type { RawJob } from "@/lib/types";
import fs from "fs/promises";
import path from "path";

// Cache at Vercel Edge for 6 hours (21600 seconds)
export const revalidate = 21600;

const GITHUB_RAW_URL = "https://raw.githubusercontent.com/Toymakerftw/kljob/main/data/jobs.json";
const GITHUB_SECONDARY_URL = "https://github.com/Toymakerftw/kljob/raw/refs/heads/main/data/jobs.json";

async function fetchRawJobs(): Promise<RawJob[]> {
  for (const url of [GITHUB_RAW_URL, GITHUB_SECONDARY_URL]) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data as RawJob[];
        }
      }
    } catch {
      // try next source
    }
  }

  // Fallback to local snapshot if network is unreachable
  try {
    const snapshotPath = path.join(process.cwd(), "public", "jobs-snapshot.json");
    const content = await fs.readFile(snapshotPath, "utf-8");
    const data = JSON.parse(content);
    if (Array.isArray(data) && data.length > 0) {
      return data as RawJob[];
    }
  } catch {
    // fallback failed
  }

  throw new Error("Failed to fetch jobs from all sources");
}

export async function GET() {
  try {
    const rawJobs = await fetchRawJobs();

    // Server-side processing: derives title, skills, experience so the browser doesn't have to
    const processed = processJobs(rawJobs);

    // Slim down payload for instant initial render: strip full descriptions and slim searchText
    const summary = processed.map(({ description, searchText: _st, ...rest }) => ({
      ...rest,
      searchText: [rest.title, rest.company, rest.park, rest.skills.join(" "), rest.location ?? "", rest.jobType ?? ""]
        .join(" \n ")
        .toLowerCase(),
      hasDescription: Boolean(description && description.trim().length > 0),
    }));

    return NextResponse.json(
      {
        ts: Date.now(),
        count: summary.length,
        jobs: summary,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch jobs", message: (err as Error).message },
      { status: 502 }
    );
  }
}
