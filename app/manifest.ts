import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aptus Calendar',
    short_name: 'Aptus',
    description: 'A calendar aligned with natural cycles. 13 months, 28 days each, anchored to the equinox.',
    start_url: 'https://www.aptuscalendar.com',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f0e0c',
    theme_color: '#0f0e0c',
    categories: ['productivity', 'utilities'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
