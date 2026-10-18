// =============================================================
// API ADMIN GESTION DES STOCKS / MAGASIN (STORES) - Routes GET & PUT
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer tous les produits pour filtrage dynamique front-end ---
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
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
        categoryId: true,
        category: {
          select: {
            id: true,
            name_fr: true,
            departmentId: true,
            department: {
              select: { id: true, name_fr: true },
            },
          },
        },
      },
      orderBy: { name_fr: "asc" },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    console.error("Erreur GET /api/admin/stores:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des stocks" },
      { status: 500 }
    );
  }
}

// --- PUT : Mettre à jour le stock ou le seuil d'alerte d'un produit ---
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, stock, minStockAlert, incrementStock } = body;

    if (!productId || !String(productId).trim()) {
      return NextResponse.json(
        { error: "L'identifiant du produit (productId) est obligatoire." },
        { status: 400 }
      );
    }

    const productExists = await prisma.product.findUnique({
      where: { id: String(productId) },
      select: { id: true },
    });

    if (!productExists) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    const updateData: any = {};

    if (minStockAlert !== undefined && minStockAlert !== null && minStockAlert !== "") {
      updateData.minStockAlert = Math.max(0, Number(minStockAlert));
    }

    if (incrementStock !== undefined && incrementStock !== null && incrementStock !== "") {
      updateData.stock = { increment: Number(incrementStock) };
    } else if (stock !== undefined && stock !== null && stock !== "") {
      updateData.stock = Math.max(0, Number(stock));
    }

    const updatedProduct = await prisma.product.update({
      where: { id: String(productId) },
      data: updateData,
      include: {
        category: {
          include: {
            department: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error: any) {
    console.error("Erreur PUT /api/admin/stores:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la mise à jour du stock" },
      { status: 500 }
    );
  }
}