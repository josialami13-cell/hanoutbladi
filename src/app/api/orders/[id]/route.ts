// =============================================================
// API ADMIN ORDER-ITEM - Route GET par ID (Ligne de commande spécifique)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérification de la session administrateur / utilisateur interne
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Identifiant de ligne de commande manquant." },
        { status: 400 }
      );
    }

    // Récupération de la ligne de commande avec les détails du produit et de la commande parente
    const orderItem = await prisma.orderItem.findUnique({
      where: { id },
      include: {
        product: true,
        order: {
          include: {
            client: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
        },
      },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: "Ligne de commande introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json(orderItem, { status: 200 });
  } catch (error: any) {
    console.error("Erreur API GET /api/admin/order-items/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur lors de la récupération de la ligne de commande." },
      { status: 500 }
    );
  }
}