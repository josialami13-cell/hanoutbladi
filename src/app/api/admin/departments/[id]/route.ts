import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer un département par son ID ---
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        categories: true,
        _count: { select: { categories: true } },
      },
    });

    if (!department) {
      return NextResponse.json({ error: "Département non trouvé" }, { status: 404 });
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error("Erreur GET /api/admin/departments/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// --- PUT : Modifier un département ---
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    if (!body.name_fr || !String(body.name_fr).trim()) {
      return NextResponse.json({ error: "Le nom en français (name_fr) est obligatoire." }, { status: 400 });
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

    const department = await prisma.department.update({
      where: { id },
      data: {
        name_fr: String(body.name_fr).trim(),
        name_ar: body.name_ar && String(body.name_ar).trim() !== "" ? String(body.name_ar).trim() : undefined,
        slug: finalSlug,
        description_fr: body.description_fr && String(body.description_fr).trim() !== "" ? String(body.description_fr).trim() : undefined,
        description_ar: body.description_ar && String(body.description_ar).trim() !== "" ? String(body.description_ar).trim() : undefined,
        image: body.image && String(body.image).trim() !== "" ? String(body.image).trim() : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : false,
      },
    });

    return NextResponse.json(department);
  } catch (error: any) {
    console.error("Erreur PUT /api/admin/departments/[id]:", error);

    if (error.code === "P2002") {
      return NextResponse.json({ error: "Un département avec ce slug existe déjà." }, { status: 400 });
    }

    return NextResponse.json({ error: "Erreur lors de la modification du département" }, { status: 500 });
  }
}

// --- DELETE : Supprimer un département ---
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await context.params;

    // Vérifier si le département possède des catégories
    const categoriesCount = await prisma.category.count({
      where: { departmentId: id },
    });

    if (categoriesCount > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer : ce département contient ${categoriesCount} catégorie(s). Réaffectez-les ou supprimez-les d'abord.` },
        { status: 400 }
      );
    }

    await prisma.department.delete({ where: { id } });

    return NextResponse.json({ message: "Département supprimé avec succès" });
  } catch (error) {
    console.error("Erreur DELETE /api/admin/departments/[id]:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}