'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useHemisphere } from '@/lib/hemisphere-context';
import TodayTab from './TodayTab';
import YearTab from './YearTab';
import CalendarTab from './CalendarTab';
import ConvertTab from './ConvertTab';
import AboutTab from './AboutTab';

const TABS = [
  { id: 'today',    label: 'Today'    },
  { id: 'calendar', label: 'Calendar' },
  { id: 'year',     label: 'Year'     },
  { id: 'convert',  label: 'Convert'  },
  { id: 'about',    label: 'About'    },
] as const;

type TabId = typeof TABS[number]['id'];

const COMPONENTS: Record<TabId, React.ComponentType> = {
  today:    TodayTab,
  calendar: CalendarTab,
  year:     YearTab,
  convert:  ConvertTab,
  about:    AboutTab,
};

const flipVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    rotateY: dir > 0 ? 18 : -18,
    scale: 0.96,
    filter: 'blur(4px)',
  }),
  center: {
    opacity: 1,
    rotateY: 0,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: (dir: number) => ({
    opacity: 0,
    rotateY: dir > 0 ? -18 : 18,
    scale: 0.96,
    filter: 'blur(4px)',
  }),
};

export default function TabShell() {
  const [tabState, setTabState] = useState({ index: 0, direction: 1 });
  const { hemisphere, toggle } = useHemisphere();

  function goTo(next: number) {
    setTabState(prev => {
      if (next === prev.index) return prev;
      return { index: next, direction: next > prev.index ? 1 : -1 };
    });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const fwd  = e.key === 'ArrowRight' || e.key === 'ArrowDown';
      const back = e.key === 'ArrowLeft'  || e.key === 'ArrowUp';
      if (!fwd && !back) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      e.preventDefault();
      setTabState(prev => {
        const delta = fwd ? 1 : -1;
        const next = Math.max(0, Math.min(TABS.length - 1, prev.index + delta));
        if (next === prev.index) return prev;
        return { index: next, direction: delta };
      });
    }

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const ActiveTab = COMPONENTS[TABS[tabState.index].id];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0f0e0c' }}>

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <header style={{
        borderBottom: '1px solid #2e2924',
        flexShrink: 0,
        zIndex: 50,
        background: '#0f0e0c',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 2rem',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
        }}>

          {/* Wordmark */}
          <span style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '0.65rem',
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#f0ede8',
            userSelect: 'none',
          }}>
            Aptus
          </span>

          {/* Tabs */}
          <nav style={{ display: 'flex', gap: '0.15rem' }} role="tablist">
            {TABS.map((tab, i) => {
              const active = tabState.index === i;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => goTo(i)}
                  style={{
                    padding: '0.3rem 1.1rem',
                    borderRadius: 99,
                    border: 'none',
                    background: active ? '#2e2924' : 'transparent',
                    color: active ? '#f0ede8' : '#4d4740',
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Hemisphere toggle */}
          <button
            onClick={toggle}
            title={`Switch to ${hemisphere === 'SH' ? 'Northern' : 'Southern'} Hemisphere`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.28rem 0.8rem',
              borderRadius: 99,
              border: '1px solid #2e2924',
              background: 'transparent',
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.12em',
              cursor: 'pointer',
              transition: 'border-color 0.2s, color 0.2s',
              color: '#7a7368',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.borderColor = '#7a7368';
              el.style.color = '#f0ede8';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.borderColor = '#2e2924';
              el.style.color = '#7a7368';
            }}
          >
            <span style={{ opacity: hemisphere === 'SH' ? 1 : 0.35, transition: 'opacity 0.2s' }}>SH</span>
            <span style={{ opacity: 0.25 }}>/</span>
            <span style={{ opacity: hemisphere === 'NH' ? 1 : 0.35, transition: 'opacity 0.2s' }}>NH</span>
          </button>

        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          overflow: 'hidden',
          perspective: '1600px',
          perspectiveOrigin: '50% 40%',
        }}
        role="tabpanel"
      >
        <AnimatePresence custom={tabState.direction} mode="wait">
          <motion.div
            key={tabState.index}
            custom={tabState.direction}
            variants={flipVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: '100%', transformStyle: 'preserve-3d' }}
          >
            <ActiveTab />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Footer hint ──────────────────────────────────────────── */}
      <div style={{
        textAlign: 'center',
        padding: '0.6rem',
        flexShrink: 0,
        borderTop: '1px solid #1e1b18',
      }}>
        <span style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '0.55rem',
          letterSpacing: '0.12em',
          color: '#2e2924',
          textTransform: 'uppercase',
        }}>
          Scroll or ← → to navigate
        </span>
      </div>

    </div>
  );
}
