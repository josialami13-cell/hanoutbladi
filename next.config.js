// =============================================================
// CONFIGURATION NEXT.JS - Hanout Bladi
// =============================================================
// Ce fichier configure le comportement de Next.js
// =============================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Autoriser le chargement d'images depuis des sources externes
  // (pour les images de produits hébergées sur Cloudinary ou autre)
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
