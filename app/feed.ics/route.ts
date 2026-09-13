import { getAptusDate } from '@/lib/aptus';
import { buildFeed, optionsFromParams } from '@/lib/ics';

// Depends on query parameters, so it cannot be prerendered.
export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  const options = optionsFromParams(new URL(request.url).searchParams);
  const today = getAptusDate(new Date(), options.hemisphere);
  const body = buildFeed(today.year, options);

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="aptus.ics"',
      // Clients poll on their own schedule; an hour keeps the edge from
      // regenerating a decade of events for every subscriber refresh.
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
