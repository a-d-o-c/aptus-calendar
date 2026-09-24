'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * A JSON value kept in localStorage.
 *
 * Read as an external store rather than through an effect that sets state on
 * mount. The server has no storage, so the server snapshot is the fallback;
 * the stored value swaps in at hydration with no mismatch and no second
 * render pass.
 *
 * Every access is guarded. Storage can be unavailable — private windows,
 * blocked site data — and the page has to keep working when it is, so a read
 * that fails leaves the fallback standing and a write that fails is dropped
 * rather than thrown. Answers are a convenience, not the product.
 *
 * `fallback` must be a stable reference: define it at module level, not as a
 * literal in the call, or the snapshot changes identity on every render.
 */

const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, unknown>();

function snapshotOf<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let value = fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) value = JSON.parse(raw) as T;
  } catch {
    // Unavailable, or something else wrote nonsense to the key.
  }
  cache.set(key, value);
  return value;
}

export function useStored<T>(key: string, fallback: T): [T, (next: T) => void] {
  const subscribe = useCallback((onChange: () => void) => {
    let set = listeners.get(key);
    if (!set) listeners.set(key, (set = new Set()));
    set.add(onChange);
    return () => { set.delete(onChange); };
  }, [key]);

  const value = useSyncExternalStore(
    subscribe,
    useCallback(() => snapshotOf(key, fallback), [key, fallback]),
    useCallback(() => fallback, [fallback]),
  );

  const store = useCallback((next: T) => {
    cache.set(key, next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Not persisted, but it still holds for this visit.
    }
    for (const l of listeners.get(key) ?? []) l();
  }, [key]);

  return [value, store];
}
