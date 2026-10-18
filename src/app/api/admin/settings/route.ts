// =============================================================
// API ADMIN SETTINGS - Gestion de la configuration globale
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET : Récupérer la configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    let settings = await prisma.setting.findUnique({
      where: { id: "global_settings" },
    });

    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          id: "global_settings",
          storeName: "Plaza D'Oliviers",
          city: "Settat",
        },
      });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    console.error("Erreur GET /api/admin/settings:", error);
    return NextResponse.json({ error: "Erreur lors du chargement des paramètres" }, { status: 500 });
  }
}

// PUT : Mettre à jour la configuration
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();

    const {
      storeName,
      storeTagline,
      contactEmail,
      contactPhone,
      address,
      city,
      currency,
      defaultMinStockAlert,
      logoUrl,
      heroBanners,      // استقبال مصفوفة صور الكاروسيل الإعلاني
      aboutImageUrl,
      openingHours,
      enableHomeDelivery,
      enablePickup,
      standardShippingFee,
      expressShippingFee,
      paymentCashOnDelivery,
      paymentBankTransfer,
      paymentCashPlus,
      paymentCreditCard,
      videoUrls,
    } = body;

    const updatedSettings = await prisma.setting.upsert({
      where: { id: "global_settings" },
      update: {
        storeName,
        storeTagline,
        contactEmail,
        contactPhone,
        address,
        city,
        currency,
        defaultMinStockAlert: Number(defaultMinStockAlert || 5),
        logoUrl,
        heroBanners: heroBanners || [], // حفظ مصفوفة البانيرات
        aboutImageUrl,
        openingHours: openingHours || [],
        enableHomeDelivery: Boolean(enableHomeDelivery),
        enablePickup: Boolean(enablePickup),
        standardShippingFee: Number(standardShippingFee || 0),
        expressShippingFee: Number(expressShippingFee || 0),
        paymentCashOnDelivery: Boolean(paymentCashOnDelivery),
        paymentBankTransfer: Boolean(paymentBankTransfer),
        paymentCashPlus: Boolean(paymentCashPlus),
        paymentCreditCard: Boolean(paymentCreditCard),
        videoUrls: videoUrls || [],
      },
      create: {
        id: "global_settings",
        storeName: storeName || "Plaza D'Oliviers",
        storeTagline,
        contactEmail,
        contactPhone,
        address,
        city: city || "Settat",
        currency: currency || "MAD",
        defaultMinStockAlert: Number(defaultMinStockAlert || 5),
        logoUrl,
        heroBanners: heroBanners || [],
        aboutImageUrl,
        openingHours: openingHours || [],
        enableHomeDelivery: Boolean(enableHomeDelivery),
        enablePickup: Boolean(enablePickup),
        standardShippingFee: Number(standardShippingFee || 0),
        expressShippingFee: Number(expressShippingFee || 0),
        paymentCashOnDelivery: Boolean(paymentCashOnDelivery),
        paymentBankTransfer: Boolean(paymentBankTransfer),
        paymentCashPlus: Boolean(paymentCashPlus),
        paymentCreditCard: Boolean(paymentCreditCard),
        videoUrls: videoUrls || [],
      },
    });

    return NextResponse.json(updatedSettings, { status: 200 });
  } catch (error: any) {
    console.error("Erreur PUT /api/admin/settings:", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement des paramètres" }, { status: 500 });
  }
}