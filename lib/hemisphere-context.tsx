'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Hemisphere } from './aptus';

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
    const stored = localStorage.getItem('aptus-hemisphere') as Hemisphere | null;
    if (stored === 'SH' || stored === 'NH') setHemisphere(stored);
  }, []);

  function toggle() {
    setHemisphere(prev => {
      const next: Hemisphere = prev === 'SH' ? 'NH' : 'SH';
      localStorage.setItem('aptus-hemisphere', next);
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
