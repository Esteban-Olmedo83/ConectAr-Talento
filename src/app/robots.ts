import type { MetadataRoute } from 'next'

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://www.conectartalento.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/candidates',
          '/pipeline',
          '/vacancies',
          '/interviews',
          '/reports',
          '/settings',
          '/admin',
          '/talent-pool',
          '/templates',
          '/clients',
          '/integrations',
          '/job-profiles',
          '/auth/callback',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
