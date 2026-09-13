import { renderAptusIcon } from '@/lib/icon-image';

// The mark never changes, so render it once at build rather than per request.
export const dynamic = 'force-static';

export function GET() {
  return renderAptusIcon(512);
}
