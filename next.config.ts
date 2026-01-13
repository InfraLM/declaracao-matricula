import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Vercel gerencia o build automaticamente, não precisa de standalone
  // basePath removido para funcionar com URL automática da Vercel
};

export default nextConfig;
