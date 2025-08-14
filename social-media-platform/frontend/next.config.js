/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-s3-bucket.s3.amazonaws.com', 'localhost'],
  },
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig