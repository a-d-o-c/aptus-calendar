import type { MetadataRoute } from 'next';

// One entry, because the tabs are client state rather than routes. If tabs ever
// become real URLs, they belong here too.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.aptuscalendar.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
