import type { Hemisphere } from './aptus';

/**
 * Guess a first-time visitor's hemisphere from their clock.
 *
 * Only ever a first guess: a stored choice always wins, and the toggle is
 * always there. It exists because the alternative is showing every Northern
 * visitor a calendar whose seasons are inverted from their sky and hoping they
 * find the toggle before deciding the thing is broken.
 */

/**
 * Southern zones that do not observe daylight saving, so the offset test below
 * can't see them. Brazil abolished DST in 2019 and Argentina in 2009; the
 * northern half of Australia never had it.
 */
const SOUTHERN_ZONES = new Set([
  'Australia/Brisbane', 'Australia/Perth', 'Australia/Darwin', 'Australia/Lindeman',
  'Africa/Johannesburg', 'Africa/Maputo', 'Africa/Harare', 'Africa/Lusaka',
  'Africa/Gaborone', 'Africa/Windhoek', 'Africa/Luanda', 'Africa/Kinshasa',
  'Africa/Dar_es_Salaam', 'Africa/Lubumbashi', 'Africa/Blantyre',
  'America/Sao_Paulo', 'America/Bahia', 'America/Fortaleza', 'America/Recife',
  'America/Manaus', 'America/La_Paz', 'America/Lima', 'America/Montevideo',
  'America/Asuncion',
  'Indian/Mauritius', 'Indian/Reunion', 'Indian/Antananarivo',
  'Pacific/Port_Moresby', 'Pacific/Guadalcanal', 'Pacific/Noumea',
  'Pacific/Tongatapu', 'Pacific/Fiji', 'Pacific/Tahiti', 'Pacific/Efate',
  // Argentina appears under two spellings: browsers usually report the modern
  // America/Argentina/* form, but some runtimes canonicalise to these older
  // aliases, which the prefix below never sees.
  'America/Buenos_Aires', 'America/Cordoba', 'America/Rosario',
  'America/Catamarca', 'America/Jujuy', 'America/Mendoza',
]);

const SOUTHERN_PREFIXES = ['Australia/', 'Antarctica/', 'America/Argentina/'];

export function detectHemisphere(): Hemisphere {
  // Daylight saving is the strongest signal and needs no table: the southern
  // summer is in January, so a southern zone's January offset is the smaller
  // one. Zones without DST report the same offset for both and fall through.
  const january = new Date(2026, 0, 1).getTimezoneOffset();
  const july = new Date(2026, 6, 1).getTimezoneOffset();
  if (january !== july) return january < july ? 'SH' : 'NH';

  let zone = '';
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    return 'SH';   // No clue at all — keep the product's own default.
  }

  if (SOUTHERN_PREFIXES.some(p => zone.startsWith(p))) return 'SH';
  if (SOUTHERN_ZONES.has(zone)) return 'SH';
  return zone ? 'NH' : 'SH';
}
