// =============================================================
// API PRODUITS - Routes CRUD
// =============================================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer tous les produits ---
export async function GET(request: NextRequest) {
  try {
    // Lire les paramètres de l'URL (filtres)
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");
    const departmentParam = searchParams.get("department") || searchParams.get("rayon"); // Support de department & rayon
    const featured = searchParams.get("featured");
    const active = searchParams.get("active");
    const search = searchParams.get("search");

    // Construire le filtre de recherche Prisma
    const where: any = {};

    // 1. Filtre par Catégorie directe
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // 2. Filtre par Rayon / Département
    if (departmentParam) {
      where.category = {
        department: {
          OR: [
            { id: departmentParam },
            { slug: departmentParam },
            { name_fr: { equals: departmentParam, mode: "insensitive" } },
          ],
        },
      };
    }

    // 3. Filtre de recherche textuelle (Recherche)
    if (search) {
      where.OR = [
        { name_fr: { contains: search, mode: "insensitive" } },
        { name_ar: { contains: search, mode: "insensitive" } },
      ];
    }

    if (featured === "true") where.isFeatured = true;
    if (active !== "false") where.isActive = true; // Par défaut, uniquement les actifs

    // Récupérer les produits depuis la base de données
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          include: {
            department: true, // Inclure aussi le département rattaché
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Erreur GET /api/products:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 }
    );
  }
}

// --- POST : Créer un nouveau produit ---
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name_fr,
      name_ar,
      slug,
      description_fr,
      description_ar,
      price,
      image,
      images,
      stock,
      isActive,
      isFeatured,
      categoryId,
    } = body;

    if (!name_fr || !name_ar || !slug || !price || !categoryId) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (nom_fr, nom_ar, slug, prix, catégorie)" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name_fr,
        name_ar,
        slug,
        description_fr: description_fr || "",
        description_ar: description_ar || "",
        price: parseFloat(price),
        image: image || "",
        images: images || [],
        stock: parseInt(stock) || 0,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        categoryId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/products:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
      { status: 500 }
    );
  }
}