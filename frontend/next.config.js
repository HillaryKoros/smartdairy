/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // API URL is set via NEXT_PUBLIC_API_URL env var
  // In Docker: /api/v1 (through nginx)
  // Local dev: http://localhost:8021/api/v1 (direct to Django)
};

module.exports = nextConfig;
