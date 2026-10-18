import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour modifier vos préférences." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { defaultAddress, defaultCity, preferredPaymentMethod } = body;

    // Utilisation des colonnes existantes `address` et `city` de votre modèle Client Prisma
    const updatedClient = await prisma.client.update({
      where: { id: userId },
      data: {
        address: defaultAddress ? String(defaultAddress).trim() : null,
        city: defaultCity ? String(defaultCity).trim() : "Settat",
      },
    });

    return NextResponse.json(
      { success: true, message: "Préférences enregistrées avec succès.", client: updatedClient },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur PUT /api/client/preferences:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'enregistrement des préférences." },
      { status: 500 }
    );
  }
}