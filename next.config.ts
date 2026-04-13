import type { NextConfig } from "next";

const GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  "http://10.10.10.200:32118";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      // Admission service proxy
      {
        source: "/api/v1/admission-service/:path*",
        destination: `${GATEWAY_URL}/api/v1/admission-service/:path*`,
      },
      // Auth service proxy
      {
        source: "/api/v1/auth-service/:path*",
        destination: `${GATEWAY_URL}/api/v1/auth-service/:path*`,
      },
      // OTP service proxy
      {
        source: "/api/v1/otp-service/:path*",
        destination: `${GATEWAY_URL}/api/v1/otp-service/:path*`,
      },
      // Notification service proxy
      {
        source: "/api/email/v1/:path*",
        destination: `${GATEWAY_URL}/api/email/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
