// Phụ trách phần mới: Lợi. Next.js chuyển /api/v1 sang Tomcat Servlet trên cổng 8089.
const backendUrl = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:8089';
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() { return [{ source: '/api/v1/:path*', destination: `${backendUrl}/api/v1/:path*` }]; },
};
export default nextConfig;
