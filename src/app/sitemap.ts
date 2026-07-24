import type { MetadataRoute } from 'next'

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://www.conectartalento.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: APP_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${APP_URL}/tienda`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${APP_URL}/terminos`,
      lastModified: new Date('2026-04-01'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${APP_URL}/privacidad`,
      lastModified: new Date('2026-04-01'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${APP_URL}/cookies`,
      lastModified: new Date('2026-04-01'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]
}
