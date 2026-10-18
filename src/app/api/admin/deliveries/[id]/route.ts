import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer une livraison par son ID ---
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await context.params;
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        order: true,
        deliveryMan: true,
      },
    });

    if (!delivery) {
      return NextResponse.json({ error: "Livraison non trouvée" }, { status: 404 });
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error("Erreur GET /api/admin/deliveries/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// --- PUT : Modifier une livraison ---
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const isDelivered = body.status === "Livré" || body.status === "DELIVERED";

    // Mise à jour de la livraison
    const updated = await prisma.delivery.update({
      where: { id },
      data: {
        status: body.status ? String(body.status).trim() : undefined,
        shippingFee: body.shippingFee !== undefined ? Number(body.shippingFee) : undefined,
        notes: body.notes !== undefined ? (body.notes ? String(body.notes).trim() : null) : undefined,
        deliveredAt: isDelivered ? new Date() : undefined,

        // Gestion relationnelle robuste du livreur (compatible TypeScript / Prisma)
        ...(body.deliveryManId !== undefined && {
          deliveryMan: body.deliveryManId && String(body.deliveryManId).trim() !== ""
            ? { connect: { id: String(body.deliveryManId) } }
            : { disconnect: true },
        }),
      },
      include: { order: true, deliveryMan: true },
    });

    // Synchronisation du statut de la commande et du paiement si livrée
    if (isDelivered && updated.orderId) {
      await prisma.order.update({
        where: { id: updated.orderId },
        data: { 
          status: "DELIVERED" as any, 
          paymentStatus: "PENDING_COLLECTION" as any // <-- AJOUTÉ : En attente de reversement par le livreur pour l'écran des paiements
        },
      }).catch((err) => console.error("Erreur sync commande:", err));
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Erreur PUT /api/admin/deliveries/[id]:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// --- DELETE : Supprimer une livraison ---
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await context.params;
    await prisma.delivery.delete({ where: { id } });

    return NextResponse.json({ message: "Livraison supprimée avec succès" });
  } catch (error) {
    console.error("Erreur DELETE /api/admin/deliveries/[id]:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}