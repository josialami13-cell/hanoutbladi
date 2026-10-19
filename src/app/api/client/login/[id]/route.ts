// =============================================================
// API CLIENT LOGIN BY ID - Route
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Le mot de passe est requis." },
        { status: 400 }
      );
    }

    // 1. Recherche du client par son ID
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        category: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client introuvable." },
        { status: 404 }
      );
    }

    if (!client.password) {
      return NextResponse.json(
        { error: "Aucun mot de passe configuré pour ce compte." },
        { status: 400 }
      );
    }

    // 2. Vérification du mot de passe haché
    const isValidPassword = await bcrypt.compare(password, client.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Mot de passe incorrect." },
        { status: 401 }
      );
    }

    // Exclure le mot de passe de la réponse
    const { password: _, ...clientData } = client;

    return NextResponse.json({
      message: "Connexion réussie",
      client: clientData,
    });
  } catch (error) {
    console.error("Erreur POST /api/client/login/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'authentification du client" },
      { status: 500 }
    );
  }
}