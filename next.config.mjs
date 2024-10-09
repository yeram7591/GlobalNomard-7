/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['sprint-fe-project.s3.ap-northeast-2.amazonaws.com'],
  },

  experimental: {
    turboMode: false, // Turbopack 활성화
  },
};

export default nextConfig;
