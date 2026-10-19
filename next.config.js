// =============================================================
// CONFIGURATION NEXT.JS - Hanout Bladi
// =============================================================
// Ce fichier configure le comportement de Next.js
// =============================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignorer les erreurs de build et de linter pour Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Autoriser le chargement d'images depuis des sources externes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Accepte toutes les sources d'images
      },
    ],
  },
};

module.exports = nextConfig;