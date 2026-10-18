import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, password, orderReference } = body;

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: "Veuillez remplir le nom, le téléphone et le mot de passe." },
        { status: 400 }
      );
    }

    // Nettoyage et normalisation du numéro de téléphone
    const cleanPhone = String(phone).trim().replace(/\s+/g, "");

    if (cleanPhone.length < 8) {
      return NextResponse.json(
        { error: "Veuillez fournir un numéro de téléphone valide." },
        { status: 400 }
      );
    }

    // Vérification dans la table Client
    const existingClient = await prisma.client.findFirst({
      where: { phone: cleanPhone },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "Ce numéro de téléphone est déjà associé à un compte client." },
        { status: 400 }
      );
    }

    // Hachage sécurisé du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du compte dans la table Client
    const newClient = await prisma.client.create({
      data: {
        name: String(name).trim(),
        phone: cleanPhone,
        password: hashedPassword,
      },
    });

    // Rattachement automatique de la commande au client via clientId si une référence est fournie
    if (orderReference) {
      await prisma.order.updateMany({
        where: { orderNumber: String(orderReference).trim() },
        data: { clientId: newClient.id },
      });
    }

    return NextResponse.json(
      { success: true, message: "Compte client créé avec succès." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur API Register Client:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du compte." },
      { status: 500 }
    );
  }
}