
// =============================================================
// API ADMIN UTILISATEURS - Routes GET & POST
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// --- GET : Récupérer tous les utilisateurs/admin ---
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: any = {};

    if (search && search.trim() !== "") {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        { phone: { contains: term, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        permissions: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Erreur GET /api/admin/users:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors du chargement des utilisateurs" },
      { status: 500 }
    );
  }
}

// --- POST : Créer un nouvel utilisateur / membre de l'équipe ---
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, password, permissions } = body;

    if (!email || !password || !phone) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (email, téléphone, mot de passe)" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const newUser = await prisma.user.create({
      data: {
        name: name && String(name).trim() !== "" ? String(name).trim() : null,
        email: String(email).trim(),
        phone: String(phone).trim(),
        password: hashedPassword,
        permissions: Array.isArray(permissions) ? permissions : [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        permissions: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST /api/admin/users:", error);

    if (error.code === "P2002") {
      const field = error.meta?.target ? error.meta.target[0] : "email/phone";
      return NextResponse.json(
        { error: `Un utilisateur avec cet ${field} existe déjà.` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
