// Lợi: chuyển API sang Tomcat. Tân: tách cache dev/build để hai tiến trình không ghi đè nhau.
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

const backendUrl = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:8089';
/** @type {import('next').NextConfig} */
export default function nextConfig(phase) {
  return {
    // Next dev và next build không dùng chung .next khi cả hai cùng chạy.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
    async rewrites() {
      return [{ source: '/api/v1/:path*', destination: `${backendUrl}/api/v1/:path*` }];
    },
  };
}
