'use client';

import { useEffect, useState } from 'react';
import type { Celebration } from '@/lib/celebrations';
import { promptsFor, loadAnswers, saveAnswers, type Answers } from '@/lib/worksheet';

/**
 * The fillable half of a celebration. Type into it and it stays in this
 * browser; print it and you get the same questions with room to write by hand.
 * Both come from the same prompts, so the paper and the screen cannot drift.
 */
export default function Worksheet({
  cel, neYear, isMobile,
}: {
  cel: Celebration;
  neYear: number;
  isMobile: boolean;
}) {
  const prompts = promptsFor(cel);
  const [answers, setAnswers] = useState<Answers>({});

  useEffect(() => {
    setAnswers(loadAnswers(cel, neYear));
  }, [cel, neYear]);

  if (prompts.length === 0) return null;

  function update(i: number, value: string) {
    const next = { ...answers, [i]: value };
    setAnswers(next);
    saveAnswers(cel, neYear, next);
  }

  return (
    <div className="worksheet" style={{ marginTop: '1.5rem', borderTop: '1px solid #2d2e2b', paddingTop: '1.25rem' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap',
      }}>
        <div style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: '#8a7460',
        }}>
          Work through it · {cel.name} {neYear} NE
        </div>
        <button
          className="worksheet-print-button"
          onClick={() => window.print()}
          style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '0.58rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#9a8870', background: 'transparent',
            border: '1px solid #2d2e2b', borderRadius: 99, padding: '0.28rem 0.75rem', cursor: 'pointer',
          }}
        >
          Print
        </button>
      </div>

      {/* Printed only: the screen already shows this in the card header. */}
      <div className="worksheet-print-title" style={{ display: 'none' }}>
        {cel.name} · {neYear} NE
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {prompts.map((prompt, i) => (
          <div key={prompt}>
            <label
              htmlFor={`${cel.name}-${i}`}
              style={{
                display: 'block',
                fontFamily: 'var(--font-libre)', fontStyle: 'italic',
                fontSize: isMobile ? '0.85rem' : '0.88rem', color: '#c0a880',
                lineHeight: 1.7, marginBottom: '0.45rem',
              }}
            >
              {prompt}
            </label>
            <textarea
              id={`${cel.name}-${i}`}
              value={answers[i] ?? ''}
              onChange={e => update(i, e.target.value)}
              rows={3}
              placeholder="…"
              style={{
                width: '100%', boxSizing: 'border-box', resize: 'vertical',
                background: '#121110', border: '1px solid #2d2e2b', borderRadius: 6,
                color: '#ede8de', fontFamily: 'var(--font-libre)',
                fontSize: isMobile ? '0.88rem' : '0.92rem', lineHeight: 1.7,
                padding: '0.6rem 0.75rem', outline: 'none',
              }}
            />
            {/* Printed instead of the textarea: what was typed, or ruled space. */}
            <div className="worksheet-answer" style={{ display: 'none' }}>{answers[i] ?? ''}</div>
          </div>
        ))}
      </div>

      <p style={{
        fontFamily: 'var(--font-dm-mono)', fontSize: '0.55rem', letterSpacing: '0.08em',
        color: '#6d6a66', marginTop: '1rem', marginBottom: 0, lineHeight: 1.7,
      }}>
        Saved in this browser only. Nothing is sent anywhere and nothing is kept by us.
      </p>
    </div>
  );
}
