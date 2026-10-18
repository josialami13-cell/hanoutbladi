// =============================================================
// ROUTE NEXTAUTH - Gestion de l'authentification
// =============================================================
// Ce fichier expose les routes d'authentification :
// /api/auth/signin  → Page de connexion
// /api/auth/signout → Déconnexion
// /api/auth/session → Vérifier la session active
// =============================================================

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// Exporter le handler pour les requêtes GET et POST
export { handler as GET, handler as POST };
