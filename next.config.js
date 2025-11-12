/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@neynar/nodejs-sdk"],
  },
  images: {
    domains: ['letsconnect-waitlist.vercel.app', 'connectwithme-app.vercel.app'],
  },
}

module.exports = nextConfig
