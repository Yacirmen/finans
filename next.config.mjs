const isProduction = process.env.NODE_ENV === "production";
const isGitHubPages = process.env.GITHUB_PAGES === "1";
const shouldUseRepoBasePath = isProduction || isGitHubPages;
const repoBasePath = shouldUseRepoBasePath ? "/finans" : "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: repoBasePath,
  assetPrefix: repoBasePath || undefined,
  allowedDevOrigins: ["127.0.0.1", "localhost", "http://127.0.0.1:3000", "http://localhost:3000"],
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: repoBasePath,
  },
};

export default nextConfig;
