const isGitHubPages = process.env.GITHUB_PAGES === "1";
const repoBasePath = isGitHubPages ? "/finans" : "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: repoBasePath,
  assetPrefix: repoBasePath || undefined,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: repoBasePath,
  },
};

export default nextConfig;
