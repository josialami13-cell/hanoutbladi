// =============================================================
// API ADMIN LIVREUR [ID] - Routes GET, PUT & DELETE
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer un livreur par son ID ---
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const deliveryMan = await prisma.deliveryMan.findUnique({
      where: { id },
    });

    if (!deliveryMan) {
      return NextResponse.json({ error: "Livreur non trouvé" }, { status: 404 });
    }

    return NextResponse.json(deliveryMan);
  } catch (error) {
    console.error("Erreur GET /api/admin/delivery-men/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du livreur" },
      { status: 500 }
    );
  }
}

// --- PUT : Modifier un livreur (toutes variables incluses) ---
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    if (!body.fullName || !body.phone) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (fullName, phone)" },
        { status: 400 }
      );
    }

    const deliveryMan = await prisma.deliveryMan.update({
      where: { id },
      data: {
        fullName: String(body.fullName),
        phone: String(body.phone),
        zone: body.zone ? String(body.zone) : "",
        vehicle: body.vehicle ? String(body.vehicle) : "",
        status: body.status ? String(body.status) : "Disponible",
      },
    });

    return NextResponse.json(deliveryMan);
  } catch (error: any) {
    console.error("Erreur PUT /api/admin/delivery-men/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du livreur" },
      { status: 500 }
    );
  }
}

// --- DELETE : Supprimer un livreur ---
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await context.params;

    await prisma.deliveryMan.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Livreur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur DELETE /api/admin/delivery-men/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du livreur" },
      { status: 500 }
    );
  }
}