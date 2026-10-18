
// =============================================================
// API COMMANDES - Routes (Détection Langue via Cookies + Lien Officiel)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      address,
      city,
      country,
      paymentMethod,
      notes,
      clientId,
      items, // [{productId, quantity, price}]
    } = body;

    // 1. Détection de la langue depuis les cookies (par défaut "fr")
    const cookieLocale = request.cookies.get("locale")?.value || request.cookies.get("NEXT_LOCALE")?.value || "fr";
    const isArabic = cookieLocale.startsWith("ar");

    if (!customerName || !customerPhone || !address || !city || !items?.length) {
      return NextResponse.json(
        {
          error: isArabic
            ? "معلومات الطلب غير كاملة"
            : "Informations de commande incomplètes",
        },
        { status: 400 }
      );
    }

    const trimmedPhone = customerPhone.trim();
    let finalClientId = clientId;
    let isNewClient = false;
    let generatedPlainPassword = "";

    // 2. GESTION DU CLIENT (Invité vs Client Existant)
    if (finalClientId) {
      const existing = await prisma.client.findUnique({ where: { id: finalClientId } });
      if (existing) {
        await prisma.client.update({
          where: { id: existing.id },
          data: { address: address || existing.address, city: city || existing.city },
        });
      }
    } else {
      const existingClient = await prisma.client.findUnique({
        where: { phone: trimmedPhone },
      });

      if (existingClient) {
        // CAS 1 : Client déjà existant
        finalClientId = existingClient.id;
        await prisma.client.update({
          where: { id: existingClient.id },
          data: {
            address: existingClient.address || address,
            city: existingClient.city || city,
            name: customerName || existingClient.name,
          },
        });
      } else {
        // CAS 2 : Nouveau numéro -> Création compte + Mot de passe 4 chiffres
        isNewClient = true;
        generatedPlainPassword = Math.floor(1000 + Math.random() * 9000).toString();
        const hashedPassword = await bcrypt.hash(generatedPlainPassword, 10);

        const newClient = await prisma.client.create({
          data: {
            name: customerName,
            phone: trimmedPhone,
            email: customerEmail || null,
            password: hashedPassword,
            address: address,
            city: city,
 clientType: "PARTICULIER",
          },
        });
        finalClientId = newClient.id;
      }
    }

    // 3. CALCUL DES ARTICLES ET BONUS
    const finalItems: { productId: string; quantity: number; price: number }[] = [];
    let calculatedTotal = 0;

    for (const item of items) {
      finalItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
      calculatedTotal += item.price * item.quantity;

      const dbProduct = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { hasBonus: true, minQuantityForBonus: true, bonusQuantity: true, bonusProductId: true },
      });

      if (dbProduct && dbProduct.hasBonus && dbProduct.minQuantityForBonus && item.quantity >= dbProduct.minQuantityForBonus) {
        const bonusMultiplier = Math.floor(item.quantity / dbProduct.minQuantityForBonus);
        const freeUnits = (dbProduct.bonusQuantity || 1) * bonusMultiplier;
        finalItems.push({
          productId: dbProduct.bonusProductId || item.productId,
          quantity: freeUnits,
          price: 0,
        });
      }
    }

    // 4. CRÉATION DE LA COMMANDE
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const orderNumber = `HB-${dateStr}-${randomNum}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        clientId: finalClientId,
        customerName,
        customerPhone: trimmedPhone,
        customerEmail: customerEmail || null,
        address,
        city,
        country: country || "Maroc",
        totalAmount: calculatedTotal,
        paymentMethod: paymentMethod || "cash_on_delivery",
        notes: notes || null,
        items: { create: finalItems },
      },
      include: { items: { include: { product: true } }, client: true },
    });

    // 5. GÉNÉRATION DU MESSAGE WHATSAPP DANS LA LANGUE DU CLIENT
    const siteUrl = "https://www.hanoutbladi.ma";
    let message = "";

    if (isArabic) {
      // --- Message en Arabe ---
      message += `السلام عليكم ${customerName} 👋,\n\nشكراً لطلبكم من *حانوت بلادي*!\n`;
      message += `📦 *رقم الطلب:* ${orderNumber}\n`;
      message += `💰 *المجموع:* ${calculatedTotal} درهم\n\n`;

      if (isNewClient) {
        message += `✨ *تم إنشاء حسابكم بنجاح!*\n`;
        message += `📱 *اسم المستخدم (الهاتف):* ${trimmedPhone}\n`;
        message += `🔑 *الرقم السري المؤقت:* ${generatedPlainPassword}\n\n`;
        message += `🔗 لزيارة حسابكم والاطلاع على الطلب:\n${siteUrl}/shop/login\n\n`;
      } else {
        message += `🛒 تم تسجيل هذا الطلب في حسابكم الشخصي.\n`;
        message += `🌐 زيارة الموقع: ${siteUrl}\n\n`;
      }

      message += `طلبكم قيد التحضير والتأكيد. شكراً لثقتكم بنا! 🌿\n`;
      message += `🌐 *www.hanoutbladi.ma*`;

    } else {
      // --- Message en Français ---
      message += `Salam ${customerName} 👋,\n\nMerci pour votre commande sur *Hanout Bladi* !\n`;
      message += `📦 *N° de Commande :* ${orderNumber}\n`;
      message += `💰 *Total :* ${calculatedTotal} MAD\n\n`;

      if (isNewClient) {
        message += `✨ *Votre espace client a été créé avec succès !*\n`;
        message += `📱 *Identifiant (Téléphone) :* ${trimmedPhone}\n`;
        message += `🔑 *Mot de passe temporaire :* ${generatedPlainPassword}\n\n`;
        message += `🔗 Accédez à votre espace pour suivre votre commande :\n${siteUrl}/shop/login\n\n`;
      } else {
        message += `🛒 Votre commande a été enregistrée dans votre espace client.\n`;
        message += `🌐 Visitez notre site : ${siteUrl}\n\n`;
      }

      message += `Votre commande est bien confirmée et en cours de préparation. Merci de votre confiance ! 🌿\n`;
      message += `🌐 *www.hanoutbladi.ma*`;
    }

    const cleanPhone = trimmedPhone.replace(/\D/g, "");
    const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    return NextResponse.json(
      { success: true, order, isNewClient, whatsappLink },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur POST /api/orders:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
