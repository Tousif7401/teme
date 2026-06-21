/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow the dev server to be reached via the cloudflared tunnel (for sharing the test link).
  allowedDevOrigins: [
    "localhost",
    "teachers-seafood-very-sodium.trycloudflare.com",
    "*.trycloudflare.com",
  ],
};

module.exports = nextConfig;
