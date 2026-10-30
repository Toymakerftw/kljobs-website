"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Prefs } from "./types";

const SAVED_KEY = "kljobs:v1:saved";
const APPLIED_KEY = "kljobs:v1:applied";
const PREFS_KEY = "kljobs:v1:prefs";

/* ------------------------------------------------------------------ */
/* Tiny localStorage store bridged into React via useSyncExternalStore */
/* ------------------------------------------------------------------ */

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function emit(): void {
  for (const l of listeners) l();
}

/** Parse cache: keeps getSnapshot referentially stable between writes. */
const snapshotCache = new Map<string, { raw: string | null; val: unknown }>();

function readSnapshot<T>(key: string, initial: T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    raw = null;
  }
  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) return cached.val as T;
  let val: T;
  try {
    val = raw ? (JSON.parse(raw) as T) : initial;
  } catch {
    val = initial;
  }
  snapshotCache.set(key, { raw, val });
  return val;
}

function writeSnapshot(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return false; // quota exceeded — state stays in memory for this session
  }
  emit();
  return true;
}

/**
 * localStorage-backed state. Server render (and the hydration pass) sees
 * `initial`; the live value kicks in right after hydration — no flash, no
 * setState-in-effect. Returns [value, setValue].
 */
export function useStored<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const getSnapshot = useCallback(() => readSnapshot<T>(key, initial), [key, initial]);
  const getServerSnapshot = useCallback(() => initial, [initial]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const set = useCallback(
    (v: T | ((p: T) => T)) => {
      const current = readSnapshot<T>(key, initial);
      const next = typeof v === "function" ? (v as (p: T) => T)(current) : v;
      writeSnapshot(key, next);
    },
    [key, initial],
  );

  return [value, set];
}

/** True on the client after hydration, false during SSR — without effects. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

/* ------------------------------------------------------------------ */
/* Domain hooks                                                        */
/* ------------------------------------------------------------------ */

export function useSavedJobs(): [string[], (id: string) => void] {
  const [saved, setSaved] = useStored<string[]>(SAVED_KEY, []);
  const toggle = useCallback(
    (id: string) => {
      setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
    },
    [setSaved],
  );
  return [saved, toggle];
}

export function useAppliedJobs(): [Record<string, string>, (id: string) => void] {
  const [applied, setApplied] = useStored<Record<string, string>>(APPLIED_KEY, {});
  const toggle = useCallback(
    (id: string) => {
      setApplied((prev) => {
        const next = { ...prev };
        if (next[id]) delete next[id];
        else next[id] = new Date().toISOString();
        return next;
      });
    },
    [setApplied],
  );
  return [applied, toggle];
}

export const DEFAULT_PREFS: Prefs = {
  park: "all",
  sort: "recent",
  includeExpired: false,
  walkInOnly: false,
};

export function usePrefs(): [Prefs, (p: Partial<Prefs>) => void] {
  const [prefs, setPrefs] = useStored<Prefs>(PREFS_KEY, DEFAULT_PREFS);
  const update = useCallback(
    (p: Partial<Prefs>) => {
      setPrefs((prev) => ({ ...DEFAULT_PREFS, ...prev, ...p }));
    },
    [setPrefs],
  );
  return [prefs, update];
}

export function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setDebounced(value), delay);
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, [value, delay]);
  return debounced;
}
