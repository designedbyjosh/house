/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['blog.josh.house', 'i.scdn.co', 'josh-house.s3-ap-southeast-2.amazonaws.com']
  }
}

module.exports = nextConfig
