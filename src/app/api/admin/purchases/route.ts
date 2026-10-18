// =============================================================
// API ADMIN ACHATS (PURCHASES) - Multi-Produits & Gestion des stocks
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer tous les achats enregistrés ---
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const purchases = await prisma.purchase.findMany({
      include: {
        supplier: {
          select: { id: true, name: true, phone: true },
        },
        product: {
          select: { id: true, name_fr: true, sku: true, stock: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedPurchases = purchases.map((p) => ({
      ...p,
      productName: p.productName || p.product?.name_fr || "Produit inconnu",
      supplierName: p.supplierName || p.supplier?.name || "Fournisseur inconnu",
      quantity: Number(p.quantity) || 0,
    }));

    return NextResponse.json(formattedPurchases);
  } catch (error) {
    console.error("Erreur GET /api/admin/purchases:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des achats" },
      { status: 500 }
    );
  }
}

// --- POST : Enregistrer un achat multi-produits (Facture globale) ---
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { supplierId, supplierName, status, items } = body;

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Le fournisseur et au moins un produit sont obligatoires." },
        { status: 400 }
      );
    }

    // Transaction Prisma : Enregistrement global de toutes les lignes d'achats
    const createdPurchases = await prisma.$transaction(async (tx: any) => {
      const results = [];

      for (const item of items) {
        const qty = Number(item.quantity);
        const uc = Number(item.unitCost);
        const total = Number(item.totalCost);

        if (isNaN(qty) || qty <= 0 || isNaN(uc) || uc < 0) {
          throw new Error("Quantité ou prix unitaire invalide dans une des lignes.");
        }

        // 1. Vérifier l'existence du produit cible
        const targetProduct = await tx.product.findUnique({
          where: { id: String(item.productId) },
        });

        if (!targetProduct) {
          throw new Error(`Produit introuvable pour l'ID: ${item.productId}`);
        }

        // 2. Créer l'enregistrement de l'achat pour cette ligne (sans le champ notes)
        const purchase = await tx.purchase.create({
          data: {
            supplierName: String(supplierName).trim(),
            productName: targetProduct.name_fr,
            quantity: String(qty),
            totalCost: total,
            status: status ? String(status).trim() : "Livré",
            supplier: { connect: { id: String(supplierId) } },
            product: { connect: { id: targetProduct.id } },
          },
        });

        // 3. Mettre à jour automatiquement le stock et le dernier prix d'achat
        await tx.product.update({
          where: { id: targetProduct.id },
          data: {
            stock: { increment: qty },
            lastPurchasePrice: uc,
          },
        });

        results.push(purchase);
      }

      return results;
    });

    return NextResponse.json({ message: "Achats enregistrés avec succès", createdPurchases }, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST /api/admin/purchases:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la création des achats" },
      { status: 500 }
    );
  }
}