import { renderAptusIcon } from '@/lib/icon-image';

// The mark never changes, so render it once at build rather than per request.
export const dynamic = 'force-static';

// Referenced by app/manifest.ts, which needs a stable URL rather than a hashed one.
export function GET() {
  return renderAptusIcon(192);
}
