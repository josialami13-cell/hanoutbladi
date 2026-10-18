// =============================================================
// API ADMIN LIVRAISONS - Routes GET, POST & PUT
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Charger toutes les livraisons ---
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const deliveries = await prisma.delivery.findMany({
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            customerPhone: true,
            city: true,
            address: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
            shippingMode: true, // <-- Ajouté pour identifier standard vs amana côté front
          },
        },
        deliveryMan: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            zone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error("Erreur GET /api/admin/deliveries:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des livraisons" },
      { status: 500 }
    );
  }
}

// --- POST : Créer une livraison ---
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, deliveryManId, shippingFee, notes, status } = body;

    if (!orderId || !String(orderId).trim()) {
      return NextResponse.json(
        { error: "L'identifiant de la commande est obligatoire." },
        { status: 400 }
      );
    }

    // Vérifier si la commande existe et récupérer son mode de livraison
    const existingOrder = await prisma.order.findUnique({
      where: { id: String(orderId) },
      select: { id: true, shippingMode: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "La commande spécifiée est introuvable." },
        { status: 404 }
      );
    }

    // Si le mode est standard, un livreur interne est obligatoire
    const isStandard = !existingOrder.shippingMode || existingOrder.shippingMode === "standard";
    if (isStandard && (!deliveryManId || String(deliveryManId).trim() === "")) {
      return NextResponse.json(
        { error: "Cette commande est en mode Standard. Veuillez lui assigner un livreur interne." },
        { status: 400 }
      );
    }

    // Générer un numéro de suivi unique
    const trackingNumber = `TRK-${Date.now().toString().slice(-8)}`;

    const newDelivery = await prisma.delivery.create({
      data: {
        trackingNumber,
        orderId: String(orderId),
        // Si ce n'est pas le mode standard (ex: amana), on force deliveryManId à null
        deliveryManId: isStandard && deliveryManId && String(deliveryManId).trim() !== "" ? String(deliveryManId) : null,
        shippingFee: Number(shippingFee) || 0,
        status: status ? String(status).trim() : "En attente",
        notes: notes ? String(notes).trim() : null,
      },
      include: {
        order: true,
        deliveryMan: true,
      },
    });

    return NextResponse.json(newDelivery, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST /api/admin/deliveries:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Une livraison existe déjà pour cette commande." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de la livraison" },
      { status: 500 }
    );
  }
}

// --- PUT : Mettre à jour une livraison (ex: valider comme Livré) ---
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { deliveryId, status, deliveryManId, shippingFee } = body;

    if (!deliveryId) {
      return NextResponse.json({ error: "ID de livraison manquant." }, { status: 400 });
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id: String(deliveryId) },
      data: {
        ...(status !== undefined && { status: String(status) }),
        ...(deliveryManId !== undefined && { deliveryManId: deliveryManId ? String(deliveryManId) : null }),
        ...(shippingFee !== undefined && { shippingFee: Number(shippingFee) }),
        ...(status === "Livré" ? { deliveredAt: new Date() } : {}),
      },
      include: { order: true },
    });

    // Si la livraison est marquée comme livrée, on met à jour la commande pour qu'elle passe aux paiements en attente de reversement
    if (status === "Livré") {
      await prisma.order.update({
        where: { id: updatedDelivery.orderId },
        data: {
          status: "DELIVERED" as any,
          paymentStatus: "PENDING_COLLECTION" as any, // En attente de l'argent du livreur ou transporteur
        },
      });
    }

    return NextResponse.json(updatedDelivery);
  } catch (error: any) {
    console.error("Erreur PUT /api/admin/deliveries:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la mise à jour de la livraison" },
      { status: 500 }
    );
  }
}