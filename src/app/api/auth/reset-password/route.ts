import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord || resetRecord.expires < new Date()) {
      return NextResponse.json({ error: "Le lien est invalide ou a expiré." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Mise à jour pour le modèle Client
    await prisma.client.update({
      where: { email: resetRecord.email },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id },
    });

    return NextResponse.json({ success: true, message: "Mot de passe mis à jour avec succès !" });

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}