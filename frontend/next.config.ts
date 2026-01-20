import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 디버깅을 위한 설정
  serverExternalPackages: [],
  // 소스맵 활성화 (디버깅용)
  productionBrowserSourceMaps: false,
  // Docker 환경에서 파일 변경 감지를 위한 폴링 설정 (Windows + Docker)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      poll: 500, // 500ms마다 파일 변경 확인
      aggregateTimeout: 200,
      ignored: ['**/node_modules', '**/.next'],
    };
    return config;
  },
};

export default nextConfig;
