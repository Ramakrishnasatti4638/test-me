/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/s/:shortCode',
          destination: 'http://localhost:3001/s/:shortCode',
        },
      ],
      fallback: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3001/api/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
