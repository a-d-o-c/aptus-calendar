'use client';

import { useEffect, useRef, useState } from 'react';
import { getAptusDate, SEASON_COLORS, WEEK_PHASE_DESC, type AptusDate, type WeekPhase, type Season } from '@/lib/aptus';
import { useHemisphere } from '@/lib/hemisphere-context';

interface SavedDate {
  id: string;
  name: string;
  gregorian: string; // ISO date string YYYY-MM-DD
}

const SEASON_LABELS: Record<Season, string> = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
};

function AptusResult({ info, accent }: { info: AptusDate; accent: string }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem 1.5rem',
      padding: '1.5rem',
      background: '#1a1816',
      border: '1px solid #2e2924',
      borderRadius: 8,
    }}>
      {[
        { label: 'Month',   value: info.isLacuna ? '—' : info.month ?? '—' },
        { label: 'Day',     value: info.isLacuna ? 'Lacuna' : String(info.dayInMonth) },
        { label: 'Year',    value: `${info.year} NE` },
        { label: 'Season',  value: info.season ? SEASON_LABELS[info.season] : '—' },
        { label: 'Phase',   value: info.isLacuna ? '—' : (info.weekPhase ?? '—') },
        { label: 'Focus',   value: info.isLacuna ? '—' : (info.monthFocus ?? '—') },
      ].map(row => (
        <div key={row.label}>
          <div style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '0.55rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#3d3830',
            marginBottom: '0.2rem',
          }}>
            {row.label}
          </div>
          <div style={{
            fontFamily: row.label === 'Month' || row.label === 'Day'
              ? 'var(--font-cormorant)'
              : 'var(--font-dm-mono)',
            fontSize: row.label === 'Month' ? '1.5rem'
              : row.label === 'Day' ? '1.4rem'
              : '0.75rem',
            fontWeight: 300,
            color: row.label === 'Month' || row.label === 'Day' ? '#f0ede8' : accent,
            letterSpacing: row.label === 'Month' || row.label === 'Day' ? '-0.01em' : '0.08em',
          }}>
            {row.value}
          </div>
        </div>
      ))}

      {!info.isLacuna && info.weekPhase && (
        <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #2e2924' }}>
          <p style={{
            fontFamily: 'var(--font-libre)',
            fontStyle: 'italic',
            fontSize: '0.85rem',
            color: '#4d4740',
            lineHeight: 1.65,
          }}>
            {WEEK_PHASE_DESC[info.weekPhase as WeekPhase]}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ConvertTab() {
  const { hemisphere } = useHemisphere();
  const [inputDate, setInputDate] = useState('');
  const [result, setResult] = useState<AptusDate | null>(null);
  const [saved, setSaved] = useState<SavedDate[]>([]);
  const [saveName, setSaveName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aptus-birthdays');
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);

  function convert(dateStr: string) {
    if (!dateStr) { setResult(null); return; }
    const d = new Date(dateStr + 'T12:00:00');
    if (isNaN(d.getTime())) { setResult(null); return; }
    setResult(getAptusDate(d, hemisphere));
  }

  function handleInput(v: string) {
    setInputDate(v);
    convert(v);
    setShowSaveForm(false);
  }

  function saveDate() {
    if (!saveName.trim() || !inputDate) return;
    const entry: SavedDate = { id: Date.now().toString(), name: saveName.trim(), gregorian: inputDate };
    const next = [...saved, entry];
    setSaved(next);
    localStorage.setItem('aptus-birthdays', JSON.stringify(next));
    setSaveName('');
    setShowSaveForm(false);
  }

  function removeDate(id: string) {
    const next = saved.filter(d => d.id !== id);
    setSaved(next);
    localStorage.setItem('aptus-birthdays', JSON.stringify(next));
  }

  function loadSaved(s: SavedDate) {
    setInputDate(s.gregorian);
    convert(s.gregorian);
  }

  const accent = result?.season ? SEASON_COLORS[result.season].primary : '#5aad3e';

  return (
    <div style={{
      height: '100%',
      overflow: 'hidden auto',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '3rem 2rem',
    }}>
      <div style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Header */}
        <div>
          <div style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '0.58rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#4d4740',
            marginBottom: '0.6rem',
          }}>
            Date Converter
          </div>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 300,
            color: '#f0ede8',
            lineHeight: 1,
          }}>
            Gregorian → Aptus
          </h2>
        </div>

        {/* Input */}
        <div>
          <label style={{
            display: 'block',
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '0.58rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#4d4740',
            marginBottom: '0.5rem',
          }}>
            Enter a date
          </label>
          <input
            type="date"
            value={inputDate}
            onChange={e => handleInput(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              background: '#1a1816',
              border: `1px solid ${result ? accent + '60' : '#2e2924'}`,
              borderRadius: 6,
              color: '#f0ede8',
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '0.85rem',
              letterSpacing: '0.05em',
              outline: 'none',
              transition: 'border-color 0.3s ease',
              colorScheme: 'dark',
            }}
          />
        </div>

        {/* Result */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AptusResult info={result} accent={accent} />

            {!showSaveForm ? (
              <button
                onClick={() => { setShowSaveForm(true); setTimeout(() => nameRef.current?.focus(), 50); }}
                style={{
                  alignSelf: 'flex-start',
                  padding: '0.35rem 1rem',
                  border: '1px solid #2e2924',
                  borderRadius: 99,
                  background: 'transparent',
                  color: '#4d4740',
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7a7368'; e.currentTarget.style.color = '#f0ede8'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2e2924'; e.currentTarget.style.color = '#4d4740'; }}
              >
                Save this date →
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  ref={nameRef}
                  type="text"
                  placeholder="Name or label"
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveDate()}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    background: '#1a1816',
                    border: '1px solid #2e2924',
                    borderRadius: 6,
                    color: '#f0ede8',
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '0.75rem',
                    outline: 'none',
                    colorScheme: 'dark',
                  }}
                />
                <button
                  onClick={saveDate}
                  disabled={!saveName.trim()}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: 6,
                    background: saveName.trim() ? accent : '#2e2924',
                    color: saveName.trim() ? '#0f0e0c' : '#3d3830',
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: saveName.trim() ? 'pointer' : 'default',
                    transition: 'background 0.2s',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSaveForm(false)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #2e2924',
                    borderRadius: 6,
                    background: 'transparent',
                    color: '#4d4740',
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '0.6rem',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* Saved dates */}
        {saved.length > 0 && (
          <div style={{ borderTop: '1px solid #2e2924', paddingTop: '1.5rem' }}>
            <div style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '0.58rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#3d3830',
              marginBottom: '0.75rem',
            }}>
              Saved Dates
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {saved.map(s => {
                const d = new Date(s.gregorian + 'T12:00:00');
                const aptus = getAptusDate(d, hemisphere);
                const col = aptus.season ? SEASON_COLORS[aptus.season].primary : '#7a7368';
                const label = aptus.isLacuna
                  ? `Lacuna · ${aptus.year} NE`
                  : `${aptus.month} ${aptus.dayInMonth} · ${aptus.year} NE`;
                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.6rem 0.75rem',
                      background: '#1a1816',
                      border: '1px solid #2e2924',
                      borderRadius: 6,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                    onClick={() => loadSaved(s)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#3d3830'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2e2924'; }}
                  >
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: col, flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '0.7rem',
                        color: '#f0ede8',
                        letterSpacing: '0.04em',
                        marginBottom: '0.1rem',
                      }}>
                        {s.name}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '0.58rem',
                        color: col,
                        letterSpacing: '0.08em',
                      }}>
                        {label}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-dm-mono)',
                      fontSize: '0.55rem',
                      color: '#3d3830',
                      letterSpacing: '0.06em',
                    }}>
                      {s.gregorian}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); removeDate(s.id); }}
                      style={{
                        background: 'none', border: 'none',
                        color: '#3d3830', cursor: 'pointer',
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '0.7rem',
                        lineHeight: 1,
                        padding: '0.2rem',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#c85428'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#3d3830'; }}
                      aria-label={`Remove ${s.name}`}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
