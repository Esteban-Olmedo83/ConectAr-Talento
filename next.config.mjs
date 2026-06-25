import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf-parse', 'pdf2json', 'mammoth'],
  productionBrowserSourceMaps: false,
}

export default withSentryConfig(nextConfig, {
  org: 'conectar-talento',
  project: 'conectar-talento',
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
})
