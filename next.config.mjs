import { withSentryConfig } from '@sentry/nextjs'

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.sentry-cdn.com https://browser.sentry-cdn.com https://www.googletagmanager.com https://client.crisp.chat",
      "style-src 'self' 'unsafe-inline' https://client.crisp.chat",
      "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://www.google-analytics.com https://image.crisp.chat",
      "font-src 'self' https://client.crisp.chat",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com https://sentry.io https://o*.ingest.sentry.io https://ingest.sentry.io https://www.google-analytics.com https://*.analytics.google.com https://region1.analytics.google.com wss://client.relay.crisp.chat https://client.crisp.chat",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf-parse', 'pdf2json', 'mammoth'],
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: 'conectar-talento',
  project: 'conectar-talento',
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
})
