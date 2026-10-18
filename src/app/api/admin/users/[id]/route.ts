
// =============================================================
// API ADMIN UTILISATEUR [ID] - Routes GET, PUT & DELETE
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// --- GET : Récupérer un utilisateur par son ID ---
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

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Erreur GET /api/admin/users/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'utilisateur" },
      { status: 500 }
    );
  }
}

// --- PUT : Modifier un utilisateur / membre de l'équipe ---
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

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const updateData: any = {};

    if (body.name !== undefined) {
      updateData.name = body.name && String(body.name).trim() !== "" ? String(body.name).trim() : null;
    }

    if (body.email !== undefined) {
      updateData.email = body.email && String(body.email).trim() !== "" ? String(body.email).trim() : undefined;
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone && String(body.phone).trim() !== "" ? String(body.phone).trim() : undefined;
    }

    if (body.permissions !== undefined && Array.isArray(body.permissions)) {
      updateData.permissions = body.permissions;
    }

    // Si un nouveau mot de passe est fourni, on le hache
    if (body.password && String(body.password).trim() !== "") {
      updateData.password = await bcrypt.hash(String(body.password).trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Erreur PUT /api/admin/users/[id]:", error);

    if (error.code === "P2002") {
      const field = error.meta?.target ? error.meta.target[0] : "email/phone";
      return NextResponse.json(
        { error: `Cet ${field} est déjà utilisé par un autre compte.` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la modification de l'utilisateur" },
      { status: 500 }
    );
  }
}

// --- DELETE : Supprimer un utilisateur ---
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

    // Empêcher un utilisateur de se supprimer lui-même
    if ((session.user as any).id === id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte." },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error: any) {
    console.error("Erreur DELETE /api/admin/users/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}
