// =============================================================
// API ADMIN ACHAT [ID] - Routes GET, PUT & DELETE
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer le détail d'un achat ---
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

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        product: true,
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Achat non trouvé" }, { status: 404 });
    }

    return NextResponse.json(purchase);
  } catch (error: any) {
    console.error("Erreur GET /api/admin/purchases/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'achat" },
      { status: 500 }
    );
  }
}

// --- PUT : Modifier un achat et réajuster le stock ---
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
    const { productName, supplierName, quantity, totalCost, status, productId, supplierId } = body;

    const existingPurchase = await prisma.purchase.findUnique({
      where: { id },
    });

    if (!existingPurchase) {
      return NextResponse.json({ error: "Achat non trouvé" }, { status: 404 });
    }

    const oldQty = Number(existingPurchase.quantity) || 0;
    const newQty = quantity !== undefined ? Number(quantity) : oldQty;
    const diffQty = newQty - oldQty;

    const updatedPurchase = await prisma.$transaction(async (tx: any) => {
      // 1. Mise à jour de l'achat
      const purchase = await tx.purchase.update({
        where: { id },
        data: {
          productName: productName ? String(productName).trim() : undefined,
          supplierName: supplierName ? String(supplierName).trim() : undefined,
          quantity: quantity !== undefined ? String(newQty) : undefined,
          totalCost: totalCost !== undefined ? Number(totalCost) : undefined,
          status: status ? String(status).trim() : undefined,
          ...(supplierId !== undefined && {
            supplier: supplierId ? { connect: { id: String(supplierId) } } : { disconnect: true },
          }),
          ...(productId !== undefined && {
            product: productId ? { connect: { id: String(productId) } } : { disconnect: true },
          }),
        },
        include: { supplier: true, product: true },
      });

      // 2. Réajustement de la différence de stock si la quantité change
      const targetProductId = productId || existingPurchase.productId;
      if (targetProductId && diffQty !== 0) {
        await tx.product.update({
          where: { id: String(targetProductId) },
          data: {
            stock: { increment: diffQty },
          },
        }).catch((err: any) => console.error("Erreur réajustement stock:", err));
      }

      return purchase;
    });

    return NextResponse.json(updatedPurchase);
  } catch (error: any) {
    console.error("Erreur PUT /api/admin/purchases/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'achat" },
      { status: 500 }
    );
  }
}

// --- DELETE : Supprimer un achat et réincrémenter/décrémenter le stock ---
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

    const purchase = await prisma.purchase.findUnique({
      where: { id },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Achat introuvable" }, { status: 404 });
    }

    const qtyToDelete = Number(purchase.quantity) || 0;

    await prisma.$transaction(async (tx: any) => {
      // 1. Décrémentation du stock si l'achat était relié à un produit
      if (purchase.productId && qtyToDelete > 0) {
        await tx.product.update({
          where: { id: purchase.productId },
          data: {
            stock: { decrement: qtyToDelete },
          },
        }).catch((err: any) => console.error("Erreur décrémentation stock:", err));
      }

      // 2. Suppression de la fiche d'achat
      await tx.purchase.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "Achat supprimé avec succès" }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur DELETE /api/admin/purchases/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'achat" },
      { status: 500 }
    );
  }
}