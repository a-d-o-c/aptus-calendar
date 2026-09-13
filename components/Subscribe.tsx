'use client';

import { useState } from 'react';
import { useHemisphere } from '@/lib/hemisphere-context';
import { DEFAULT_OPTIONS, type FeedOptions } from '@/lib/ics';

const TOGGLES: Array<{
  key: keyof Omit<FeedOptions, 'hemisphere' | 'alarm'>;
  label: string;
  note: string;
  /** Turning this on makes the toggle redundant, so it is disabled. */
  supersededBy?: keyof FeedOptions;
}> = [
  { key: 'months',       label: 'Months',       note: '13 a year' },
  { key: 'seasons',      label: 'Seasons',      note: '4 a year', supersededBy: 'months' },
  { key: 'celebrations', label: 'Celebrations', note: '7 a year' },
  { key: 'vow',          label: 'Vow checks',   note: '5 a year', supersededBy: 'celebrations' },
  { key: 'weeks',        label: 'Weeks',        note: '52 a year' },
  { key: 'days',         label: 'Every day',    note: '365 a year' },
];

const ALARMS: Array<{ value: number | null; label: string }> = [
  { value: null, label: 'No reminder' },
  { value: 0,    label: 'On the day' },
  { value: 1,    label: 'A day before' },
  { value: 3,    label: 'Three days before' },
];

export default function Subscribe({ isMobile }: { isMobile: boolean }) {
  const { hemisphere } = useHemisphere();
  const [options, setOptions] = useState<FeedOptions>(DEFAULT_OPTIONS);
  const [copied, setCopied] = useState(false);

  const params = new URLSearchParams({ h: hemisphere });
  for (const { key } of TOGGLES) if (options[key]) params.set(key, '1');
  if (options.alarm !== null) params.set('alarm', String(options.alarm));
  const url = `https://aptuscalendar.com/feed.ics?${params.toString()}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);   // Clipboard blocked; the URL is selectable anyway.
    }
  }

  const label = {
    fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem',
    letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#8a7460',
  };

  return (
    <div style={{ borderTop: '1px solid #2d2e2b', paddingTop: '2.5rem', textAlign: 'left' }}>
      <div style={{ ...label, marginBottom: '0.75rem', textAlign: 'center' }}>
        Put Aptus in your calendar
      </div>
      <p style={{
        fontFamily: 'var(--font-libre)', fontSize: isMobile ? '0.88rem' : '0.92rem',
        color: '#9a8870', lineHeight: 1.8, maxWidth: 540, margin: '0 auto 1.75rem',
        textAlign: 'center',
      }}>
        Subscribe and Aptus days arrive in the calendar you already use. Choose how much
        of it you want — most people want the months and the seven celebrations, and
        nothing else.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
        {TOGGLES.map(({ key, label: text, note, supersededBy }) => {
          const off = supersededBy ? Boolean(options[supersededBy]) : false;
          const on = options[key] && !off;
          return (
            <button
              key={key}
              disabled={off}
              onClick={() => setOptions(o => ({ ...o, [key]: !o[key] }))}
              title={off ? `Already covered by ${String(supersededBy)}` : `${text} — ${note}`}
              style={{
                padding: '0.3rem 0.8rem', borderRadius: 99,
                border: `1px solid ${on ? '#c0a880' : '#2d2e2b'}`,
                background: on ? '#c0a880' : 'transparent',
                color: off ? '#4d4a46' : on ? '#121110' : '#9a8870',
                fontFamily: 'var(--font-dm-mono)', fontSize: '0.6rem',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: off ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease',
              }}
            >
              {text} <span style={{ opacity: 0.6 }}>· {note}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
        {ALARMS.map(({ value, label: text }) => (
          <button
            key={String(value)}
            onClick={() => setOptions(o => ({ ...o, alarm: value }))}
            style={{
              padding: '0.28rem 0.7rem', borderRadius: 99,
              border: `1px solid ${options.alarm === value ? '#9a8870' : '#2d2e2b'}`,
              background: 'transparent',
              color: options.alarm === value ? '#ede8de' : '#8a7460',
              fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
          >
            {text}
          </button>
        ))}
      </div>

      <div style={{
        display: 'flex', gap: '0.5rem', alignItems: 'stretch',
        maxWidth: 620, margin: '0 auto', flexDirection: isMobile ? 'column' : 'row',
      }}>
        <code style={{
          flex: 1, background: '#1d1d1c', border: '1px solid #2d2e2b', borderRadius: 6,
          padding: '0.6rem 0.75rem', fontFamily: 'var(--font-dm-mono)', fontSize: '0.6rem',
          color: '#9a8870', overflowX: 'auto', whiteSpace: 'nowrap', lineHeight: 1.8,
        }}>
          {url}
        </code>
        <button
          onClick={copy}
          style={{
            border: '1px solid #2d2e2b', borderRadius: 6, background: 'transparent',
            color: copied ? '#c0a880' : '#9a8870', padding: '0.6rem 1rem',
            fontFamily: 'var(--font-dm-mono)', fontSize: '0.6rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <p style={{
        fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', color: '#6d6a66',
        lineHeight: 1.8, maxWidth: 620, margin: '0.9rem auto 0', textAlign: 'center',
      }}>
        Google Calendar: Other calendars → From URL. Apple Calendar: File → New Calendar
        Subscription. Outlook: Add calendar → Subscribe from web.
        Feeds refresh on the client&rsquo;s own schedule, often only once a day.
      </p>
    </div>
  );
}
