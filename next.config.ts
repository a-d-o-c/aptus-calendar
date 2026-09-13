import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The apex is canonical. Without this both hosts answered 200 independently,
      // so search engines saw two copies of one site and og:url disagreed with
      // whatever address the visitor actually typed.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.aptuscalendar.com' }],
        destination: 'https://aptuscalendar.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
