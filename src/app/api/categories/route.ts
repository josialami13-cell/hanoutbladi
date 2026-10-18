// =============================================================
// API CATÉGORIES - Routes CRUD (Multilingue Complet & Rayon)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer toutes les catégories avec toutes leurs traductions ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentParam = searchParams.get("department") || searchParams.get("rayon");

    // Construction de la clause de filtrage
    const where: any = { isActive: true };

    // Filtre par département (par ID, par Slug ex: "food", ou par nom)
    if (departmentParam) {
      where.department = {
        OR: [
          { id: departmentParam },
          { slug: departmentParam },
          { name_fr: { equals: departmentParam, mode: "insensitive" } },
        ],
      };
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        department: true,
        _count: { select: { products: true } },
      },
      orderBy: { name_fr: "asc" },
    });

    // Retourner l'intégralité des données pour que le client gère l'affichage multilingue
    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      image: cat.image,
      departmentId: cat.departmentId,
      department: cat.department,
      isActive: cat.isActive,
      isFeatured: cat.isFeatured,
      name_fr: cat.name_fr,
      name_ar: cat.name_ar,
      description_fr: cat.description_fr,
      description_ar: cat.description_ar,
      _count: cat._count,
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error("Erreur GET /api/categories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 }
    );
  }
}

// --- POST : Créer une nouvelle catégorie avec support bilingue et département ---
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    let { name_fr, name_ar, slug, image, description_fr, description_ar, departmentId } = body;

    if (!name_fr && !name_ar) {
      return NextResponse.json(
        { error: "Veuillez fournir au moins un nom" },
        { status: 400 }
      );
    }

    if (!departmentId) {
      return NextResponse.json(
        { error: "Le département est obligatoire" },
        { status: 400 }
      );
    }

    // Sécurité de secours bilingue
    if (!name_fr) name_fr = name_ar;
    if (!name_ar) name_ar = name_fr;

    if (!slug) {
      slug = name_fr
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    const category = await prisma.category.create({
      data: {
        name_fr,
        name_ar,
        slug,
        image: image || null,
        description_fr: description_fr || null,
        description_ar: description_ar || null,
        departmentId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/categories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}