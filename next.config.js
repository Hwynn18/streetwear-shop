/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // 상품 이미지 외부 호스팅 허용 (관리자가 이미지 URL로 등록하는 구조)
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
