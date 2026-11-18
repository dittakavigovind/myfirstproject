/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.29.133', 'localhost', '127.0.0.1'],
};

export default nextConfig;
