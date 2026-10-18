// =============================================================
// API ADMIN MAGASIN/STOCK [ID] - Routes GET, PUT & DELETE
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer les détails de stock et l'historique d'un produit ---
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

    const storeProduct = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        sku: true,
        barcode: true,
        name_fr: true,
        name_ar: true,
        stock: true,
        minStockAlert: true,
        price: true,
        lastPurchasePrice: true,
        unit: true,
        isActive: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name_fr: true,
            department: {
              select: { id: true, name_fr: true },
            },
          },
        },
        purchases: {
          select: {
            id: true,
            supplierName: true,
            quantity: true,
            totalCost: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            order: {
              select: {
                id: true,
                orderNumber: true,
                status: true,
                createdAt: true,
              },
            },
          },
          orderBy: { order: { createdAt: "desc" } },
          take: 5,
        },
      },
    });

    if (!storeProduct) {
      return NextResponse.json(
        { error: "Produit non trouvé en magasin" },
        { status: 404 }
      );
    }

    return NextResponse.json(storeProduct);
  } catch (error: any) {
    console.error("Erreur GET /api/admin/stores/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération du stock du produit" },
      { status: 500 }
    );
  }
}

// --- PUT : Réajustement direct du stock ou alerte pour un produit spécifique ---
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
    const { stock, minStockAlert, incrementStock, lastPurchasePrice } = body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true, stock: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (minStockAlert !== undefined && minStockAlert !== null && minStockAlert !== "") {
      updateData.minStockAlert = Math.max(0, Number(minStockAlert));
    }

    if (lastPurchasePrice !== undefined && lastPurchasePrice !== null && lastPurchasePrice !== "") {
      updateData.lastPurchasePrice = Number(lastPurchasePrice);
    }

    if (incrementStock !== undefined && incrementStock !== null && incrementStock !== "") {
      updateData.stock = { increment: Number(incrementStock) };
    } else if (stock !== undefined && stock !== null && stock !== "") {
      updateData.stock = Math.max(0, Number(stock));
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        sku: true,
        name_fr: true,
        stock: true,
        minStockAlert: true,
        lastPurchasePrice: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("Erreur PUT /api/admin/stores/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du stock du produit" },
      { status: 500 }
    );
  }
}

// --- DELETE : Remettre le stock à zéro pour un produit ---
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

    const resetProduct = await prisma.product.update({
      where: { id },
      data: {
        stock: 0,
      },
      select: {
        id: true,
        name_fr: true,
        stock: true,
      },
    });

    return NextResponse.json({
      message: "Stock réinitialisé à 0 avec succès",
      product: resetProduct,
    });
  } catch (error: any) {
    console.error("Erreur DELETE /api/admin/stores/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la réinitialisation du stock" },
      { status: 500 }
    );
  }
}