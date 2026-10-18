// =============================================================
// API CATÉGORIES - Routes CRUD
// =============================================================
// GET  = Récupérer toutes les catégories
// POST = Créer une nouvelle catégorie (admin seulement)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer toutes les catégories ---
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
        department: true,
      },
      orderBy: { name_fr: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erreur GET /api/categories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 }
    );
  }
}

// --- POST : Créer une nouvelle catégorie ---
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name_fr, name_ar, slug, image, description_fr, description_ar, departmentId } = body;

    if (!name_fr || !name_fr.trim()) {
      return NextResponse.json(
        { error: "Le nom en français (name_fr) est obligatoire." },
        { status: 400 }
      );
    }

    // Génération automatique du slug si non fourni
    const finalSlug = (slug || name_fr)
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Vérifier l'unicité du slug
    const existingCat = await prisma.category.findUnique({
      where: { slug: finalSlug },
    });

    if (existingCat) {
      return NextResponse.json(
        { error: "Une catégorie avec ce slug existe déjà." },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name_fr: name_fr.trim(),
        name_ar: name_ar?.trim() || null,
        slug: finalSlug,
        image: image?.trim() || null,
        description_fr: description_fr?.trim() || null,
        description_ar: description_ar?.trim() || null,
        departmentId: departmentId || null,
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