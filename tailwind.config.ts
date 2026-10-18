import type { Config } from "tailwindcss";

const config: Config = {
  // Chemins d'accès aux composants et pages (prend en compte app/ et src/)
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Couleurs personnalisées de la marque Hanout Bladi
      colors: {
        primary: {
          50: "#FDF8F4",    // Beige très clair
          100: "#F9E8D9",
          200: "#F2D0B3",
          300: "#E8B48A",
          400: "#D4A574",   // Doré / Sable
          500: "#C8553D",   // Terracotta (couleur principale)
          600: "#9E3A28",   // Terracotta foncé
          700: "#7A2D1F",
          800: "#5C2118",
          900: "#3D1610",
        },
        secondary: {
          50: "#E8F5EE",
          100: "#D1EBE0",
          200: "#A3D7C1",
          300: "#75C3A2",
          400: "#40916C",   // Vert clair
          500: "#2D6A4F",   // Vert marocain (couleur secondaire)
          600: "#245A42",
          700: "#1B4A35",
          800: "#123A28",
          900: "#0A2A1B",
        },
      },
      // Polices personnalisées
      fontFamily: {
        heading: ["Playfair Display", "serif"],
        body: ["Poppins", "sans-serif"],
        arabic: ["Noto Sans Arabic", "sans-serif"],
      },
      // Animation fluide pour le défilement continu des produits
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-33.33%)" },
        },
      },
      animation: {
        marquee: "marquee 25s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;