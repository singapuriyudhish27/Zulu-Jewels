/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    proxyClientMaxBodySize: "500mb",
  },
  // Prevent bundling of server-only packages that use Node.js internals
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
