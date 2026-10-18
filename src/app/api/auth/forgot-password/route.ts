// =============================================================
// API AUTH - Mot de passe oublié (Génération lien WhatsApp)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Numéro de téléphone requis" },
        { status: 400 }
      );
    }

    // Rechercher le client par son numéro de téléphone
    const client = await prisma.client.findUnique({
      where: { phone: phone.trim() },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Aucun compte client associé à ce numéro de téléphone." },
        { status: 404 }
      );
    }

    // Générer un token unique et une date d'expiration (15 minutes)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Enregistrer le token dans le modèle Client
    await prisma.client.update({
      where: { id: client.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Créer le lien de réinitialisation de votre application
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/shop/reset-password?token=${resetToken}`;

    // Préparer le message WhatsApp
    const message = `Bonjour ${client.name || "cher client"},\n\nVous avez demandé la réinitialisation de votre mot de passe sur Hanout Bladi.\n\nCliquez sur le lien ci-dessous pour définir un nouveau mot de passe (valable 15 minutes) :\n${resetUrl}`;

    // Nettoyer le numéro pour l'URL WhatsApp (garder uniquement les chiffres)
    const cleanPhone = client.phone.replace(/\D/g, "");
    const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    return NextResponse.json(
      { success: true, whatsappLink, message: "Lien WhatsApp généré avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur POST /api/auth/forgot-password:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}