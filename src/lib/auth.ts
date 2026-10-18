// =============================================================
// AUTHENTIFICATION - NextAuth.js (Séparée Client / Admin)
// =============================================================

import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    phone?: string | null;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      phone?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    phone?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/client/login", 
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Identifiant", type: "text" },
        password: { label: "Mot de passe", type: "password" },
        loginType: { label: "Type", type: "text" }, // "client" ou "admin"
      },

      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const rawIdentifier = credentials.identifier.trim();
        const rawPassword = credentials.password.trim();
        const loginType = credentials.loginType || "client"; // Par défaut client

        let account: any = null;
        let role = "CLIENT";

        // CAS 1 : CONNEXION ADMIN / EMPLOYÉ (Table User)
        if (loginType === "admin") {
          account = await prisma.user.findUnique({
            where: { email: rawIdentifier.toLowerCase() },
          });

          if (!account) return null;
          role = account.role || "ADMIN";
        } 
        // CAS 2 : CONNEXION CLIENT E-COMMERCE (Table Client)
        else {
          const isEmail = rawIdentifier.includes("@");

          if (isEmail) {
            account = await prisma.client.findUnique({
              where: { email: rawIdentifier.toLowerCase() },
            });
          } else {
            const cleanPhone = rawIdentifier.replace(/\s+/g, "").replace(/^(\+212|0)/, "");
            account = await prisma.client.findFirst({
              where: {
                OR: [
                  { phone: rawIdentifier },
                  { phone: cleanPhone },
                  { phone: `+212${cleanPhone}` },
                  { phone: `0${cleanPhone}` },
                ],
              },
            });
          }
          role = "CLIENT";
        }

        if (!account || !account.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(rawPassword, account.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: account.id,
          email: account.email || "",
          name: account.name || "",
          phone: account.phone || "",
          role: role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      if (trigger === "update" && session) {
        if (session.user?.name) token.name = session.user.name;
        if (session.user?.phone) token.phone = session.user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) || "";
        session.user.role = (token.role as string) || "CLIENT";
        session.user.phone = (token.phone as string) || "";
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };