import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d2yxi852jrw2dw.cloudfront.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "datanetneydev.blob.core.windows.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "dqfesk38cs7qk.cloudfront.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "image.mux.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "dk-dev",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "www.yashrajfilms.com",
        pathname: "**",
      },
    ],
  },
};

export default withPWA(nextConfig);
