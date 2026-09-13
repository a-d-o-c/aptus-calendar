'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Hemisphere } from './aptus';
import { detectHemisphere } from './detect-hemisphere';

interface HemisphereCtx {
  hemisphere: Hemisphere;
  toggle: () => void;
}

const HemisphereContext = createContext<HemisphereCtx>({
  hemisphere: 'SH',
  toggle: () => {},
});

export function HemisphereProvider({ children }: { children: React.ReactNode }) {
  const [hemisphere, setHemisphere] = useState<Hemisphere>('SH');

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem('aptus-hemisphere');
    } catch {
      // Storage unavailable; fall through to detection.
    }
    // A choice always beats a guess.
    if (stored === 'SH' || stored === 'NH') setHemisphere(stored);
    else setHemisphere(detectHemisphere());
  }, []);

  function toggle() {
    setHemisphere(prev => {
      const next: Hemisphere = prev === 'SH' ? 'NH' : 'SH';
      try {
        localStorage.setItem('aptus-hemisphere', next);
      } catch {
        // Not persisted, but the toggle still works for this visit.
      }
      return next;
    });
  }

  return (
    <HemisphereContext.Provider value={{ hemisphere, toggle }}>
      {children}
    </HemisphereContext.Provider>
  );
}

export function useHemisphere() {
  return useContext(HemisphereContext);
}
