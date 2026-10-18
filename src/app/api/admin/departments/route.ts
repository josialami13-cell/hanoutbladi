// =============================================================
// API DÉPARTEMENTS - Routes CRUD (GET & POST)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer tous les départements avec leurs catégories ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");

    const where: any = {};
    if (active !== "all" && active !== "false") {
      where.isActive = true;
    }

    const departments = await prisma.department.findMany({
      where,
      include: {
        categories: {
          orderBy: { name_fr: "asc" },
        },
        _count: {
          select: { categories: true },
        },
      },
      orderBy: { name_fr: "asc" },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Erreur GET /api/admin/departments:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des départements" },
      { status: 500 }
    );
  }
}

// --- POST : Créer un nouveau département ---
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name_fr, name_ar, slug, description_fr, description_ar, isActive, isFeatured } = body;

    if (!name_fr || !String(name_fr).trim()) {
      return NextResponse.json(
        { error: "Le nom en français (name_fr) est obligatoire." },
        { status: 400 }
      );
    }

    // Génération automatique du slug si non fourni
    const rawSlug = slug || name_fr;
    const finalSlug = String(rawSlug)
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const department = await prisma.department.create({
      data: {
        name_fr: String(name_fr).trim(),
        name_ar: name_ar && String(name_ar).trim() !== "" ? String(name_ar).trim() : undefined,
        slug: finalSlug,
        description_fr: description_fr && String(description_fr).trim() !== "" ? String(description_fr).trim() : undefined,
        description_ar: description_ar && String(description_ar).trim() !== "" ? String(description_ar).trim() : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
      },
      include: {
        _count: {
          select: { categories: true },
        },
      },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST /api/admin/departments:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Un département avec ce slug existe déjà." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du département" },
      { status: 500 }
    );
  }
}