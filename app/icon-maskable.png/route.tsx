import { renderAptusIcon } from '@/lib/icon-image';

// The mark never changes, so render it once at build rather than per request.
export const dynamic = 'force-static';

// Smaller wheel: launchers crop maskable icons to their own shape.
export function GET() {
  return renderAptusIcon(512, 0.6);
}
