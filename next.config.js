/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'source.unsplash.com',
      'images.unsplash.com',
      'res.cloudinary.com',
      'plus.unsplash.com',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
}
module.exports = nextConfig
