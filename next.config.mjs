// Для GitHub Pages сайт лежит в подпапке репозитория: NEXT_PUBLIC_BASE_PATH=/poliklinika
// (задаётся в .github/workflows/deploy.yml). Локально переменной нет — всё работает от корня.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
