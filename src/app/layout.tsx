import type { Metadata } from 'next'
import { DM_Sans, Nunito } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Analytics } from '@/components/Analytics'
import { CrispChat } from '@/components/CrispChat'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
})

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
})

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://conect-ar-talento-esteban-olmedo83s-projects.vercel.app'

const SITE_NAME = 'ConectAr Talento'
const SITE_TITLE = `${SITE_NAME} — ATS para LATAM`
const SITE_DESCRIPTION =
  'El talento que buscás, conectado en un solo lugar. Plataforma ATS moderna para reclutadores latinoamericanos.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['ATS', 'reclutamiento', 'LATAM', 'candidatos', 'vacantes', 'HR', 'inteligencia artificial'],
  authors: [{ name: 'ConectAr HR' }],
  creator: 'ConectAr HR',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: APP_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  description:
    'Plataforma ATS con IA para reclutadores latinoamericanos. Analizá CVs con Gemini, gestioná tu pipeline Kanban y publicá en todos los job boards de LATAM.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: APP_URL,
  offers: [
    {
      '@type': 'Offer',
      name: 'Plan Gratuito',
      price: '0',
      priceCurrency: 'USD',
    },
    {
      '@type': 'Offer',
      name: 'Plan Starter',
      price: '29',
      priceCurrency: 'USD',
    },
    {
      '@type': 'Offer',
      name: 'Plan Pro',
      price: '79',
      priceCurrency: 'USD',
    },
    {
      '@type': 'Offer',
      name: 'Plan Business',
      price: '149',
      priceCurrency: 'USD',
    },
  ],
  inLanguage: 'es',
  audience: {
    '@type': 'BusinessAudience',
    audienceType: 'Reclutadores y profesionales de RRHH de Latinoamérica',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${nunito.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
        <CrispChat />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
