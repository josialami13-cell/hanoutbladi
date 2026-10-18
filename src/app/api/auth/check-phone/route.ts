import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Numéro de téléphone requis" }, { status: 400 });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, "").replace(/^(\+212|0)/, "");

    // Recherche dans la table Client avec différentes variations du format marocain
    const client = await prisma.client.findFirst({
      where: {
        OR: [
          { phone: phone.trim() },
          { phone: cleanPhone },
          { phone: `+212${cleanPhone}` },
          { phone: `0${cleanPhone}` },
        ],
      },
    });

    return NextResponse.json({ exists: !!client });
  } catch (error) {
    console.error("Erreur lors de la vérification du téléphone:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}