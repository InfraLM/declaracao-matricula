import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  basePath: process.env.NODE_ENV === 'production' ? '/gerador-matricula' : '',
};

export default nextConfig;
