import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 디버깅을 위한 설정
  serverExternalPackages: [],
  // 소스맵 활성화 (디버깅용)
  productionBrowserSourceMaps: false,
};

export default nextConfig;
