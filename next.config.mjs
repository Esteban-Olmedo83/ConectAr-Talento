/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf-parse', 'pdf2json', 'mammoth'],
  productionBrowserSourceMaps: false,
}

export default nextConfig
