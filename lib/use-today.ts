'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { getAptusDate, type AptusDate, type Hemisphere } from './aptus';

/**
 * Today, as one store the whole app shares.
 *
 * The clock is external state in the React sense: the server cannot know the
 * viewer's local date, and it moves on its own. useSyncExternalStore is the
 * hook for exactly that — it renders null on the server, swaps to the real
 * date after hydration without a mismatch, and needs no effect to do it.
 *
 * Five tabs used to run this themselves. Sharing it means one timer for the
 * app rather than one per mounted tab, and every tab turning over on the same
 * tick instead of whenever each happened to mount.
 */

let snapshot: number | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  if (timer === null) {
    // A minute is fine: the value is a calendar day, and the only edge that
    // matters is midnight.
    timer = setInterval(() => {
      snapshot = Date.now();
      for (const l of listeners) l();
    }, 60_000);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Cached, not live: returning a fresh value on every call would never settle. */
function getSnapshot(): number {
  if (snapshot === null) snapshot = Date.now();
  return snapshot;
}

/** No clock on the server. Callers render their empty state until hydration. */
function getServerSnapshot(): null {
  return null;
}

/** Today's Aptus date, or null while server-rendering and during hydration. */
export function useToday(hemisphere: Hemisphere): AptusDate | null {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(
    () => (now === null ? null : getAptusDate(new Date(now), hemisphere)),
    [now, hemisphere],
  );
}

/** The same instant the Aptus date was derived from, for Gregorian formatting. */
export function useNow(): Date | null {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => (now === null ? null : new Date(now)), [now]);
}
