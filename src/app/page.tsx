import type { Metadata } from 'next'
import LandingClient from './_components/LandingClient'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.conectartalento.com'

export const metadata: Metadata = {
  title: 'ConectAr Talento — ATS con IA para reclutadores de LATAM',
  description: 'La plataforma ATS con IA para reclutadores latinoamericanos. Analizá CVs, publicá en todos los job boards de LATAM y gestioná entrevistas desde un solo lugar.',
  alternates: { canonical: APP_URL },
  openGraph: {
    url: APP_URL,
    title: 'ConectAr Talento — ATS con IA para reclutadores de LATAM',
    description: 'La plataforma ATS con IA para reclutadores latinoamericanos. Analizá CVs, publicá en todos los job boards de LATAM y gestioná entrevistas desde un solo lugar.',
  },
}

export default function LandingPage() {
  return <LandingClient />
}
