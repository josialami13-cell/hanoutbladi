// =============================================================
// API ADMIN CATÉGORIE [ID] - Routes GET, PUT & DELETE
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer une catégorie par son ID avec son département ---
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        department: true,
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erreur GET /api/admin/categories/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la catégorie" },
      { status: 500 }
    );
  }
}

// --- PUT : Modifier une catégorie ---
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

    if (!body.name_fr || !String(body.name_fr).trim()) {
      return NextResponse.json(
        { error: "Le nom en français (name_fr) est obligatoire." },
        { status: 400 }
      );
    }

    const rawSlug = body.slug || body.name_fr;
    const finalSlug = String(rawSlug)
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const category = await prisma.category.update({
      where: { id },
      data: {
        name_fr: String(body.name_fr).trim(),
        name_ar: body.name_ar ? String(body.name_ar).trim() : null,
        slug: finalSlug,
        image: body.image ? String(body.image).trim() : null,
        description_fr: body.description_fr ? String(body.description_fr).trim() : null,
        description_ar: body.description_ar ? String(body.description_ar).trim() : null,
        
        // Gestion propre du département (connexion si l'ID est fourni)
        ...(body.departmentId
          ? { department: { connect: { id: String(body.departmentId) } } }
          : {}),

        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : false,
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Erreur PUT /api/admin/categories/[id]:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Une catégorie avec ce slug existe déjà." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la modification de la catégorie" },
      { status: 500 }
    );
  }
}

// --- DELETE : Supprimer une catégorie ---
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

    // Vérifier si la catégorie est associée à des produits
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer : cette catégorie contient ${productsCount} produit(s). Veuillez d'abord réaffecter ou supprimer ces produits.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Catégorie supprimée avec succès" });
  } catch (error) {
    console.error("Erreur DELETE /api/admin/categories/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la catégorie" },
      { status: 500 }
    );
  }
}