const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    // value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.stripe.com https://api.razorpay.com https://maps.googleapis.com; connect-src 'self' https://api.stripe.com https://api.razorpay.com https://nominatim.openstreetmap.org https://open.er-api.com; img-src 'self' data: blob: https://res.cloudinary.com https://checkout.stripe.com; frame-src 'self' https://checkout.stripe.com https://api.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
    // value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://api.razorpay.com https://maps.googleapis.com; connect-src 'self' https://api.stripe.com https://api.razorpay.com https://nominatim.openstreetmap.org https://open.er-api.com https://ipapi.co; img-src 'self' data: blob: https://res.cloudinary.com https://checkout.stripe.com; media-src 'self' blob: https://res.cloudinary.com; frame-src 'self' https://checkout.stripe.com https://api.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;`.replace(/\n/g, ' ')
    value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://api.razorpay.com https://checkout.razorpay.com https://cdn.razorpay.com https://maps.googleapis.com; connect-src 'self' blob: https://api.stripe.com https://js.stripe.com https://checkout.stripe.com https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com https://nominatim.openstreetmap.org https://open.er-api.com https://ipapi.co; img-src 'self' data: blob: https://res.cloudinary.com https://js.stripe.com https://checkout.stripe.com https://checkout.razorpay.com https://cdn.razorpay.com; media-src 'self' blob: https://res.cloudinary.com; frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com https://api.razorpay.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; form-action 'self' https://checkout.stripe.com https://api.razorpay.com;`.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.stripe.com")'
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker/CapRover deployment: produces a self-contained server
  // in .next/standalone that doesn't need the full node_modules at runtime.
  output: 'standalone',
  images: {
    // Use Cloudinary's own CDN transformation instead of proxying through Next.js image optimizer.
    // This eliminates the TimeoutError on /_next/image for Cloudinary-hosted assets.
    loader: 'custom',
    loaderFile: './src/lib/cloudinaryLoader.js',
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    minimumCacheTTL: 31536000, // 1 year — Cloudinary images are immutable (versioned URLs)
  },
  // Prevent bundling of server-only packages that use Node.js internals
  serverExternalPackages: ["@react-pdf/renderer"],
  // async redirects() {
  //   return [
  //     {
  //       source: '/Pages/About',
  //       destination: '/Pages/about',
  //       permanent: true,
  //     },
  //   ];
  // },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
