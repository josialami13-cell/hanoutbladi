import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour modifier votre profil." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, phone, email } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Le nom et le numéro de téléphone sont obligatoires." },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).trim().replace(/\s+/g, "");

    // Vérification que le numéro n'est pas déjà pris par un autre client
    const existingClient = await prisma.client.findFirst({
      where: {
        phone: cleanPhone,
        NOT: { id: userId },
      },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "Ce numéro de téléphone est déjà utilisé par un autre compte." },
        { status: 400 }
      );
    }

    // Mise à jour dans la table Client
    const updatedClient = await prisma.client.update({
      where: { id: userId },
      data: {
        name: String(name).trim(),
        phone: cleanPhone,
        email: email ? String(email).trim().toLowerCase() : null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Profil mis à jour avec succès.", client: updatedClient },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur PUT /api/client/profile:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour du profil." },
      { status: 500 }
    );
  }
}