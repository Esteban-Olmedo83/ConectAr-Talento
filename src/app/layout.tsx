import type { Metadata } from 'next'
import { DM_Sans, Nunito } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

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

export const metadata: Metadata = {
  title: 'ConectAr Talento — ATS para LATAM',
  description:
    'El talento que buscás, conectado en un solo lugar. Plataforma ATS moderna para reclutadores latinoamericanos.',
  keywords: ['ATS', 'reclutamiento', 'LATAM', 'candidatos', 'vacantes', 'HR'],
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
