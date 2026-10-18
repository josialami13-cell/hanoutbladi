// =============================================================
// API CLIENT - Modifier ou Annuler une commande (si 'PENDING')
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id: orderId } = await params;
    const body = await req.json();
    const { address, city, notes, action } = body; // action: 'update' ou 'cancel'

    // Récupérer la commande pour vérifier qu'elle appartient bien au client
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.clientId !== userId) {
      return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    }

    // Vérification avec l'Enum Prisma en majuscules
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Impossible de modifier ou d'annuler cette commande car elle est déjà en cours de traitement ou livrée." },
        { status: 400 }
      );
    }

    if (action === "cancel") {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" }, // Aligné avec l'Enum Prisma
      });
      return NextResponse.json({ message: "Commande annulée avec succès.", order: updatedOrder }, { status: 200 });
    }

    // Sinon, mise à jour des informations (adresse, notes...)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        address: address ? String(address).trim() : order.address,
        city: city ? String(city).trim() : order.city,
        notes: notes !== undefined ? (notes ? String(notes).trim() : null) : order.notes,
      },
    });

    return NextResponse.json({ message: "Commande mise à jour avec succès.", order: updatedOrder }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur PATCH order:", error);
    return NextResponse.json({ error: error.message || "Erreur lors de la modification de la commande." }, { status: 500 });
  }
}