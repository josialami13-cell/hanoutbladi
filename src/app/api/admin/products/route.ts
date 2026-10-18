// =============================================================
// API ADMIN PRODUITS - Routes GET & POST
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper pour générer un slug propre à partir du nom FR (gère les accents)
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

// --- GET : Récupérer tous les produits avec filtre et recherche ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const active = searchParams.get("active");
    const search = searchParams.get("search");

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (active !== "all" && active !== "false") where.isActive = true;

    if (search && search.trim() !== "") {
      const term = search.trim();
      where.OR = [
        { name_fr: { contains: term, mode: "insensitive" } },
        { name_ar: { contains: term, mode: "insensitive" } },
        { sku: { contains: term, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          include: {
            department: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Erreur GET /api/admin/products:", error);
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
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.name_fr || !body.categoryId || body.price === undefined) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (name_fr, categoryId, price)" },
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

    const parseDate = (val: any) => {
      if (!val) return undefined;
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    };

    const product = await prisma.product.create({
      data: {
        name_fr: String(body.name_fr).trim(),
        price: Number(body.price),
        category: { connect: { id: String(body.categoryId) } },
        slug: finalSlug,

        sku: body.sku && String(body.sku).trim() !== "" ? String(body.sku).trim() : undefined,
        name_ar: body.name_ar && String(body.name_ar).trim() !== "" ? String(body.name_ar).trim() : undefined,
        description_fr: body.description_fr && String(body.description_fr).trim() !== "" ? String(body.description_fr).trim() : undefined,
        description_ar: body.description_ar && String(body.description_ar).trim() !== "" ? String(body.description_ar).trim() : undefined,
        
        images: Array.isArray(imagesArray) ? imagesArray.map(String) : [],
        
        discount: body.discount !== undefined && body.discount !== "" ? Number(body.discount) : 0.0,
        stock: body.stock !== undefined ? Number(body.stock) : 0,
        unit: body.unit && String(body.unit).trim() !== "" ? String(body.unit).trim() : undefined,
        promotionalBadge: body.badge || body.promotionalBadge ? String(body.badge || body.promotionalBadge).trim() : undefined,
        
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        isFeatured: Boolean(body.isFeatured),
        
        expirationDate: parseDate(body.expirationDate),
        weight: body.weight !== undefined && body.weight !== null && body.weight !== "" ? Number(body.weight) : undefined,
        dimensions: body.dimensions && String(body.dimensions).trim() !== "" ? String(body.dimensions).trim() : undefined,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST /api/admin/products:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Un produit avec ce slug ou SKU existe déjà." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
      { status: 500 }
    );
  }
}