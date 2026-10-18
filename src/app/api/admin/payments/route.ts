// =============================================================
// API ADMIN PAIEMENTS - Routes GET & POST (Corrigé pour l'Enum Prisma)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer uniquement les paiements actifs (non archivés) ---
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const method = searchParams.get("method");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // 💡 RÈGLE CORRIGÉE : On utilise uniquement les valeurs valides de l'Enum Prisma (ex: DELIVERED, APPROVED)
    // et on exclut formellement les "ARCHIVED".
    const where: any = {
      status: {
        in: [
          "DELIVERED",
          "APPROVED"
        ],
        not: "ARCHIVED",
      },
    };

    if (method && method !== "all") {
      where.paymentMethod = method;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (search && search.trim() !== "") {
      const term = search.trim();
      where.OR = [
        { orderNumber: { contains: term, mode: "insensitive" } },
        { customerName: { contains: term, mode: "insensitive" } },
        { customerPhone: { contains: term, mode: "insensitive" } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        totalAmount: true,
        paymentMethod: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        updatedAt: true,
        delivery: {
          select: {
            id: true,
            shippingFee: true,
            status: true,
            deliveredAt: true,
            deliveryMan: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erreur GET /api/admin/payments:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des paiements" },
      { status: 500 }
    );
  }
}

// --- POST : Valider le paiement (PAID), basculer en ARCHIVED et retirer des paiements en cours ---
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, paymentMethod, status, paymentStatus } = body;

    if (!orderId || !String(orderId).trim()) {
      return NextResponse.json(
        { error: "L'identifiant de la commande (orderId) est obligatoire." },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (paymentMethod !== undefined) updateData.paymentMethod = String(paymentMethod).trim();
    if (status !== undefined) updateData.status = String(status).trim();
    if (paymentStatus !== undefined) updateData.paymentStatus = String(paymentStatus).trim();

    // Dès que le paiement est validé (PAID), la commande passe automatiquement en ARCHIVED
    if (paymentStatus === "PAID" || status === "PAID") {
      updateData.paymentStatus = "PAID";
      updateData.status = "ARCHIVED"; 
    }

    const updatedOrder = await prisma.order.update({
      where: { id: String(orderId) },
      data: updateData,
      include: {
        delivery: {
          include: {
            deliveryMan: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("Erreur POST /api/admin/payments:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du paiement" },
      { status: 500 }
    );
  }
}