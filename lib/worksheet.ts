import type { Celebration } from './celebrations';

/**
 * A celebration's practice list mixes two things: instructions ("Give one
 * purposeful thing") and questions ("What am I ready to refuse?"). Only the
 * questions belong in a worksheet — the rest is guidance to read, not fill in.
 * Derived rather than flagged, so adding a question to the data is enough.
 *
 * Match a question mark anywhere, not just at the end: Hayta's central prompt
 * is "What is the one thing this year is for? Not a list — one direction," and
 * an end-anchored test silently dropped the vow, which is the spine of the
 * whole system.
 */
export function promptsFor(cel: Celebration): string[] {
  return cel.practice.filter(p => p.includes('?'));
}

/** One worksheet per celebration per year — last year's Arfa stays readable. */
function keyFor(cel: Celebration, neYear: number): string {
  return `aptus:worksheet:${cel.name}:${neYear}`;
}

export type Answers = Record<number, string>;

/**
 * Answers live in the browser and nowhere else — no account, no server, and
 * nothing leaves the device. Storage can be unavailable (private windows,
 * blocked site data), so every access is guarded and failure is silent.
 */
export function loadAnswers(cel: Celebration, neYear: number): Answers {
  try {
    const raw = localStorage.getItem(keyFor(cel, neYear));
    return raw ? (JSON.parse(raw) as Answers) : {};
  } catch {
    return {};
  }
}

export function saveAnswers(cel: Celebration, neYear: number, answers: Answers): void {
  try {
    localStorage.setItem(keyFor(cel, neYear), JSON.stringify(answers));
  } catch {
    // Nothing to do — the worksheet still works for this sitting.
  }
}

export function hasAnswers(answers: Answers): boolean {
  return Object.values(answers).some(a => a.trim() !== '');
}
