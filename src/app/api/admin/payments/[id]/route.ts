// =============================================================
// API ADMIN PAIEMENT PAR ID - Routes GET, PUT & DELETE
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer le détail financier d'une commande ---
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

    const paymentDetail = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        totalAmount: true,
        paymentMethod: true,
        paymentStatus: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        delivery: {
          select: {
            id: true,
            trackingNumber: true,
            shippingFee: true,
            status: true,
            deliveredAt: true,
            deliveryMan: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
          },
        },
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                name_fr: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    if (!paymentDetail) {
      return NextResponse.json(
        { error: "Règlement / Commande introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(paymentDetail);
  } catch (error: any) {
    console.error("Erreur GET /api/admin/payments/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération du paiement" },
      { status: 500 }
    );
  }
}

// --- PUT : Mettre à jour le statut du paiement ou de la livraison ---
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

    const { status, paymentMethod, paymentStatus, shippingFee } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { delivery: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    const newStatus = status ? String(status).trim() : undefined;
    const isDelivered = newStatus === "DELIVERED" || newStatus === "Livré";

    // 1. Mise à jour de la commande (corrigé pour éviter l'incompatibilité de type null)
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(newStatus !== undefined && { status: newStatus as any }),
        ...(paymentMethod !== undefined && paymentMethod ? { paymentMethod: String(paymentMethod).trim() } : {}),
        ...(paymentStatus !== undefined && { paymentStatus: paymentStatus ? String(paymentStatus).trim() as any : undefined }),
      },
    });

    // 2. Mise à jour ou synchronisation de la livraison associée si présente
    if (existingOrder.delivery || shippingFee !== undefined || isDelivered) {
      await prisma.delivery.upsert({
        where: { orderId: id },
        update: {
          shippingFee: shippingFee !== undefined ? Number(shippingFee) : undefined,
          status: isDelivered ? "Livré" : undefined,
          deliveredAt: isDelivered ? new Date() : undefined,
        },
        create: {
          order: { connect: { id } },
          shippingFee: shippingFee !== undefined ? Number(shippingFee) : 0,
          status: isDelivered ? "Livré" : "En attente",
          deliveredAt: isDelivered ? new Date() : undefined,
        },
      });
    }

    const result = await prisma.order.findUnique({
      where: { id },
      include: {
        delivery: {
          include: { deliveryMan: true },
        },
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erreur PUT /api/admin/payments/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du paiement" },
      { status: 500 }
    );
  }
}

// --- DELETE : Supprimer ou réinitialiser le suivi du paiement ---
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

    // Réinitialisation de l'état de la commande à "pending"
    const resetOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "pending" as any,
      },
    });

    return NextResponse.json({
      message: "Statut du paiement réinitialisé en 'pending'",
      order: resetOrder,
    });
  } catch (error: any) {
    console.error("Erreur DELETE /api/admin/payments/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la réinitialisation du paiement" },
      { status: 500 }
    );
  }
}