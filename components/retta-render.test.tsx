// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

/**
 * Retta next falls in 12030, so none of this renders until 22 Sept 2031.
 * These tests are the only thing exercising that path before then: they move
 * the clock onto a real Retta day and check the tabs draw it rather than
 * falling through the month layout with nothing to show.
 *
 * The clock has to be set before the modules load, because useToday caches
 * its first reading — hence resetModules and the dynamic imports.
 */

// Day 366 of 12030 NE. Day 365 is Otium, the day before.
const RETTA = new Date(2031, 8, 22, 12);
const OTIUM = new Date(2031, 8, 21, 12);
const ORDINARY = new Date(2026, 8, 23, 12);   // Verna 1, 12026

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.resetModules();
});

async function renderAt(when: Date, module: string) {
  vi.useFakeTimers();
  vi.setSystemTime(when);
  vi.resetModules();
  const { default: Tab } = await import(module);
  return render(<Tab />);
}

test('Today names Retta rather than falling through to a month', async () => {
  await renderAt(RETTA, '@/components/TodayTab');
  expect(screen.getAllByText('Retta').length).toBeGreaterThan(0);
  expect(screen.queryByText('Otium')).toBeNull();
});

test('Today still names Otium on the day before', async () => {
  await renderAt(OTIUM, '@/components/TodayTab');
  expect(screen.getAllByText('Otium').length).toBeGreaterThan(0);
  expect(screen.queryByText('Retta')).toBeNull();
});

test('an ordinary day is unaffected', async () => {
  await renderAt(ORDINARY, '@/components/TodayTab');
  expect(screen.getAllByText('Verna').length).toBeGreaterThan(0);
  expect(screen.queryByText('Retta')).toBeNull();
  expect(screen.queryByText('Otium')).toBeNull();
});

test('the year view shows a Retta card only in a Retta year', async () => {
  await renderAt(RETTA, '@/components/CalendarTab');
  expect(screen.getByText('Day 366 · Calibration')).toBeDefined();
  expect(screen.getByText('Day 365 · Outside the structure')).toBeDefined();

  cleanup();
  vi.resetModules();
  await renderAt(ORDINARY, '@/components/CalendarTab');
  expect(screen.queryByText('Day 366 · Calibration')).toBeNull();
  expect(screen.getByText('Day 365 · Outside the structure')).toBeDefined();
});

test('the wheel survives a Retta day without a negative month lookup', async () => {
  // monthIndex is -1 outside the count; SEGMENTS[-1] would be undefined and
  // throw on property access. This renders the whole tab, so it would.
  const { container } = await renderAt(RETTA, '@/components/YearTab');
  // The wheel drew, and the tab put real content on the page.
  expect(container.querySelector('svg')).not.toBeNull();
  expect((container.textContent ?? '').length).toBeGreaterThan(20);
});
