// =============================================================
// API ADMIN PRODUIT [ID] - Routes GET, PUT & DELETE
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseValidDate(val: any): Date | undefined {
  if (!val) return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
}

// --- GET : Récupérer un produit par son ID avec sa catégorie ---
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erreur GET /api/admin/products/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du produit" },
      { status: 500 }
    );
  }
}

// --- PUT : Modifier un produit ---
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

    if (!body.name_fr || !body.categoryId) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (name_fr, categoryId)" },
        { status: 400 }
      );
    }

    const finalSlug = body.slug && String(body.slug).trim() !== "" 
      ? slugify(body.slug) 
      : slugify(body.name_fr);

    let imagesArray = body.images;
    if (!imagesArray && body.image) {
      imagesArray = [body.image];
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name_fr: String(body.name_fr).trim(),
        slug: finalSlug,
        category: { connect: { id: String(body.categoryId) } },

        sku: body.sku && String(body.sku).trim() !== "" ? String(body.sku).trim() : undefined,
        name_ar: body.name_ar && String(body.name_ar).trim() !== "" ? String(body.name_ar).trim() : undefined,
        description_fr: body.description_fr && String(body.description_fr).trim() !== "" ? String(body.description_fr).trim() : undefined,
        description_ar: body.description_ar && String(body.description_ar).trim() !== "" ? String(body.description_ar).trim() : undefined,
        barcode: body.barcode && String(body.barcode).trim() !== "" ? String(body.barcode).trim() : undefined,
        color: body.color && String(body.color).trim() !== "" ? String(body.color).trim() : undefined,
        brand: body.brand && String(body.brand).trim() !== "" ? String(body.brand).trim() : undefined,
        images: Array.isArray(imagesArray) ? imagesArray.map(String) : [],
        
        // Booléens
        isPickup: Boolean(body.isPickup),
        isPreorder: Boolean(body.isPreorder),
        isCassable: Boolean(body.isCassable),
        isBoutique: Boolean(body.isBoutique),
        isNonStock: Boolean(body.isNonStock),
        isDateExpChecked: Boolean(body.isDateExpChecked),
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        isFeatured: Boolean(body.isFeatured),
        
        promotionalBadge: body.promotionalBadge || body.badge ? String(body.promotionalBadge || body.badge).trim() : undefined,
        isTempControlled: Boolean(body.isTempControlled),
        minTemp: body.minTemp !== null && body.minTemp !== undefined && body.minTemp !== "" ? Number(body.minTemp) : undefined,
        maxTemp: body.maxTemp !== null && body.maxTemp !== undefined && body.maxTemp !== "" ? Number(body.maxTemp) : undefined,
        preparationDays: Number(body.preparationDays || 0),
        expirationDate: parseValidDate(body.expirationDate),
        loyaltyPoints: Number(body.loyaltyPoints || 0),
        
        type1: body.type1 && String(body.type1).trim() !== "" ? String(body.type1).trim() : undefined,
        type2: body.type2 && String(body.type2).trim() !== "" ? String(body.type2).trim() : undefined,
        type3: body.type3 && String(body.type3).trim() !== "" ? String(body.type3).trim() : undefined,
        type4: body.type4 && String(body.type4).trim() !== "" ? String(body.type4).trim() : undefined,
        
        ch1: Boolean(body.ch1),
        ch2: Boolean(body.ch2),
        ch3: Boolean(body.ch3),
        ch4: Boolean(body.ch4),
        ch5: Boolean(body.ch5),
        
        unit: body.unit && String(body.unit).trim() !== "" ? String(body.unit).trim() : undefined,
        weight: body.weight !== null && body.weight !== undefined && body.weight !== "" ? Number(body.weight) : undefined,
        dimensions: body.dimensions && String(body.dimensions).trim() !== "" ? String(body.dimensions).trim() : undefined,
        packagingType: body.packagingType && String(body.packagingType).trim() !== "" ? String(body.packagingType).trim() : undefined,
        minQuantity: Number(body.minQuantity || 1),
        maxQuantity: body.maxQuantity !== null && body.maxQuantity !== undefined && body.maxQuantity !== "" ? Number(body.maxQuantity) : undefined,
        stock: Number(body.stock || 0),
        minStockAlert: Number(body.minStockAlert || 5),
        price: Number(body.price || 0),
        lastPurchasePrice: body.lastPurchasePrice !== null && body.lastPurchasePrice !== undefined && body.lastPurchasePrice !== "" ? Number(body.lastPurchasePrice) : undefined,
        discount: Number(body.discount || 0),
        tva: Number(body.tva || 0),
        shippingFee: Number(body.shippingFee || 0),
        totalPrice: body.totalPrice !== null && body.totalPrice !== undefined && body.totalPrice !== "" ? Number(body.totalPrice) : undefined,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Erreur PUT /api/admin/products/[id]:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Un conflit est survenu : ce slug, SKU ou code-barres existe déjà." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la modification du produit" },
      { status: 500 }
    );
  }
}

// --- DELETE : Supprimer un produit ---
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

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Produit supprimé avec succès" });
  } catch (error) {
    console.error("Erreur DELETE /api/admin/products/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du produit" },
      { status: 500 }
    );
  }
}