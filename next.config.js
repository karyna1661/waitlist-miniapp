/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@neynar/nodejs-sdk"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'letsconnect-waitlist.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'connectwithme-app.vercel.app',
      },
    ],
  },
}

module.exports = nextConfig
