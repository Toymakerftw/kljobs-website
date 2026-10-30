"use client";

import { Fragment } from "react";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Highlights occurrences of the (whitespace-split) query inside text.
 * Renders <mark> for matches; plain text otherwise.
 */
export function Highlight({ text = "", query }: { text?: string; query: string }) {
  if (!text) return null;
  const terms = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length >= 2)
    .map(escapeRegExp);

  if (terms.length === 0) return <>{text}</>;

  let re: RegExp;
  try {
    re = new RegExp(`(${terms.join("|")})`, "gi");
  } catch {
    return <>{text}</>;
  }

  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) =>
        terms.some((t) => new RegExp(`^${t}$`, "i").test(part)) ? (
          <mark key={i}>{part}</mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
