import type { NextConfig } from "next";

const pinataGateway = process.env.NEXT_PUBLIC_GATEWAY_URL!;

const nextConfig: NextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: pinataGateway,
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "stagepass.mypinata.cloud",
        pathname: "/**"
      },
    ]
  }
};

export default nextConfig;
