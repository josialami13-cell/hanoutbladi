// =============================================================
// API ADMIN FOURNISSEUR [ID] - Routes GET, PUT & DELETE
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer un fournisseur par son ID ---
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

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchases: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { purchases: true },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: "Fournisseur non trouvé" }, { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (error: any) {
    console.error("Erreur GET /api/admin/suppliers/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération du fournisseur" },
      { status: 500 }
    );
  }
}

// --- PUT : Mettre à jour un fournisseur par son ID ---
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
    const { name, contactPerson, phone, city, speciality } = body;

    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      return NextResponse.json({ error: "Fournisseur non trouvé" }, { status: 404 });
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: name !== undefined ? String(name).trim() : undefined,
        contactPerson: contactPerson !== undefined 
          ? (String(contactPerson).trim() !== "" ? String(contactPerson).trim() : null) 
          : undefined,
        phone: phone !== undefined 
          ? (String(phone).trim() !== "" ? String(phone).trim() : null) 
          : undefined,
        city: city !== undefined 
          ? (String(city).trim() !== "" ? String(city).trim() : null) 
          : undefined,
        speciality: speciality !== undefined 
          ? (String(speciality).trim() !== "" ? String(speciality).trim() : null) 
          : undefined,
      },
    });

    return NextResponse.json(updatedSupplier);
  } catch (error: any) {
    console.error("Erreur PUT /api/admin/suppliers/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du fournisseur" },
      { status: 500 }
    );
  }
}

// --- DELETE : Supprimer un fournisseur par son ID ---
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

    await prisma.supplier.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Fournisseur supprimé avec succès" });
  } catch (error: any) {
    console.error("Erreur DELETE /api/admin/suppliers/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du fournisseur" },
      { status: 500 }
    );
  }
}