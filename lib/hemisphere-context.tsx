'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import type { Hemisphere } from './aptus';
import { detectHemisphere } from './detect-hemisphere';

const KEY = 'aptus-hemisphere';

/**
 * The hemisphere is external state: stored per browser, shared by every tab,
 * and unknowable on the server. Reading it as a store rather than in an effect
 * means the server renders the default and the real choice swaps in at
 * hydration — no mismatch, and no second render to get there.
 *
 * Kept as a bare 'SH' / 'NH' rather than JSON because that is what earlier
 * versions wrote. Changing the format would quietly reset the saved choice
 * for everyone who already has one.
 */

let current: Hemisphere | null = null;
const listeners = new Set<() => void>();

function resolve(): Hemisphere {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch {
    // Storage unavailable; fall through to detection.
  }
  // A choice always beats a guess.
  return stored === 'SH' || stored === 'NH' ? stored : detectHemisphere();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => { listeners.delete(onChange); };
}

/** Cached: resolving on every call would hand React a new answer each render. */
function getSnapshot(): Hemisphere {
  if (current === null) current = resolve();
  return current;
}

/** No storage on the server, and no timezone to detect from. */
function getServerSnapshot(): Hemisphere {
  return 'SH';
}

function set(next: Hemisphere): void {
  current = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Not persisted, but the toggle still works for this visit.
  }
  for (const l of listeners) l();
}

interface HemisphereCtx {
  hemisphere: Hemisphere;
  toggle: () => void;
}

const HemisphereContext = createContext<HemisphereCtx>({
  hemisphere: 'SH',
  toggle: () => {},
});

export function HemisphereProvider({ children }: { children: React.ReactNode }) {
  const hemisphere = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = useCallback(() => set(getSnapshot() === 'SH' ? 'NH' : 'SH'), []);
  const value = useMemo(() => ({ hemisphere, toggle }), [hemisphere, toggle]);

  return (
    <HemisphereContext.Provider value={value}>
      {children}
    </HemisphereContext.Provider>
  );
}

export function useHemisphere() {
  return useContext(HemisphereContext);
}
