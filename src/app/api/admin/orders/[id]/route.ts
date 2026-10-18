// =============================================================
// API ADMIN COMMANDE [ID] - Routes GET, PUT & DELETE (Synchronisé Client)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer une commande avec ses articles, son client et sa livraison ---
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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        client: { 
          select: { id: true, name: true, email: true, phone: true, address: true, city: true, favoriteProducts: true },
        },
        items: {
          include: {
            product: true,
          },
        },
        delivery: {
          include: {
            deliveryMan: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Erreur GET /api/admin/orders/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération de la commande" },
      { status: 500 }
    );
  }
}

// --- PUT : Modifier le statut, paiement ou l'assignation de livraison ---
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

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    const newStatus = body.status !== undefined ? String(body.status).trim() : undefined;
    const isCancelled = newStatus === "CANCELLED" || newStatus === "Annulée";
    const wasNotCancelled = String(existingOrder.status) !== "CANCELLED" && String(existingOrder.status) !== "Annulée";

    // Re-créditer le stock si la commande passe au statut annulé
    if (isCancelled && wasNotCancelled && existingOrder.items.length > 0) {
      for (const item of existingOrder.items) {
        if (item.productId) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          }).catch((err: any) => console.error("Erreur réincrémentation stock:", err));
        }
      }
    }

    // Mise à jour de la commande avec forçage de type pour correspondre à l'enum Prisma
  await prisma.order.update({
      where: { id },
      data: {
        ...(newStatus !== undefined && { status: newStatus as unknown as any }),
        ...(body.paymentMethod !== undefined && { paymentMethod: String(body.paymentMethod).trim() }),
        ...(body.shippingAddress !== undefined || body.address !== undefined ? {
          address: String(body.shippingAddress || body.address).trim()
        } : {}),
        ...(body.notes !== undefined && { notes: body.notes ? String(body.notes).trim() : null }),
      },
    });

    const isStandard = (existingOrder as any).shippingMode === "standard";
    const hasDeliveryMan = body.deliveryManId !== undefined && body.deliveryManId !== null && String(body.deliveryManId).trim() !== "";

    // Gestion / Création de la livraison
    if (!isStandard || hasDeliveryMan || body.shippingFee !== undefined) {
      const trackingNumber = `TRK-${Date.now().toString().slice(-8)}`;
      const deliveryManIdStr = body.deliveryManId ? String(body.deliveryManId).trim() : null;

      await prisma.delivery.upsert({
        where: { orderId: id },
        update: {
          shippingFee: body.shippingFee !== undefined ? Number(body.shippingFee) : undefined,
          ...(newStatus === "DELIVERED" || newStatus === "Livré" ? { status: "Livré", deliveredAt: new Date() } : {}),
          ...(body.deliveryManId !== undefined && {
            deliveryMan: deliveryManIdStr
              ? { connect: { id: deliveryManIdStr } }
              : { disconnect: true },
          }),
        },
        create: {
          order: { connect: { id } },
          trackingNumber,
          shippingFee: body.shippingFee !== undefined ? Number(body.shippingFee) : 0,
          status: newStatus === "DELIVERED" || newStatus === "Livré" ? "Livré" : "En attente",
          ...(deliveryManIdStr ? { deliveryMan: { connect: { id: deliveryManIdStr } } } : {}),
        },
      });
    }

    const finalOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { product: true } },
        delivery: { include: { deliveryMan: true } },
      },
    });

    return NextResponse.json(finalOrder);
  } catch (error: any) {
    console.error("Erreur PUT /api/admin/orders/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la mise à jour de la commande" },
      { status: 500 }
    );
  }
}

// --- DELETE : Supprimer une commande ---
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

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Commande supprimée avec succès" });
  } catch (error: any) {
    console.error("Erreur DELETE /api/admin/orders/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la suppression de la commande" },
      { status: 500 }
    );
  }
}