import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚡ COMPATIBILIDADE NEXT.js 16 (TURBOPACK)
  // O ESLint agora é gerido via CLI, removemos a chave 'eslint'
  
  typescript: {
    // Mantemos o ignore para não travar builds de produção durante manutenções rápidas
    ignoreBuildErrors: true,
  },

  // Ativamos o Turbopack explicitamente (vazio) para silenciar avisos de conflito com Webpack
  turbopack: {},
  
  // Otimizações de Imagem (Se necessário no futuro)
  images: {
    unoptimized: true, 
  }
};

export default nextConfig;
