// =============================================================
// API ADMIN COMMANDES - Routes GET & POST (Synchronisé Client & Stock)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer toutes les commandes pour le Back-Office Admin ---
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    if (search && search.trim() !== "") {
      const term = search.trim();
      where.OR = [
        { orderNumber: { contains: term, mode: "insensitive" } },
        { customerName: { contains: term, mode: "insensitive" } },
        { customerPhone: { contains: term, mode: "insensitive" } },
        { city: { contains: term, mode: "insensitive" } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        client: { // Liaison vers l'acheteur (Client)
          select: { id: true, name: true, phone: true, email: true, address: true, city: true },
        },
        delivery: {
          include: {
            deliveryMan: {
              select: { id: true, fullName: true, phone: true },
            },
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erreur GET /api/admin/orders:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    );
  }
}

// --- POST : Création sécurisée de commande avec gestion Client & décrémentation du stock ---
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      customerName, 
      customerPhone, 
      customerEmail, 
      address, 
      city, 
      totalAmount, 
      shippingMode, 
      items, 
      shippingFee,
      paymentMethod,
      notes
    } = body;

    if (!customerName || !String(customerName).trim() || !customerPhone || !String(customerPhone).trim() || !address || !city) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs de livraison obligatoires." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Le panier doit contenir au moins un produit" },
        { status: 400 }
      );
    }

    const cleanPhone = String(customerPhone).trim().replace(/\s+/g, "");
    const cleanedName = String(customerName).trim();
    const cleanedEmail = customerEmail && String(customerEmail).trim() !== "" ? String(customerEmail).trim() : null;
    const cleanedAddress = String(address).trim();
    const cleanedCity = String(city).trim();

    const mode = shippingMode || "standard";
    const isStandard = mode === "standard";

    // Génération du numéro de commande au format JJMMYYYY-XX
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const datePrefix = `${day}${month}${year}`;

    const countToday = await prisma.order.count({
      where: {
        orderNumber: {
          startsWith: datePrefix,
        },
      },
    });

    const increment = String(countToday + 1).padStart(2, '0');
    const orderNumber = `${datePrefix}-${increment}`;
    const trackingNumber = `TRK-${Date.now().toString().slice(-8)}`;

    // 1. GESTION DE LA TABLE CLIENT (Recherche par téléphone unique ou création)
    let client = await prisma.client.findUnique({
      where: { phone: cleanPhone },
    });

    if (client) {
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          name: cleanedName,
          email: cleanedEmail || client.email,
          address: cleanedAddress || client.address,
          city: cleanedCity || client.city,
        },
      });
    } else {
      client = await prisma.client.create({
        data: {
          name: cleanedName,
          phone: cleanPhone,
          email: cleanedEmail,
          address: cleanedAddress,
          city: cleanedCity,
        },
      });
    }

    // 2. Transaction Prisma (Vérification des stocks, création commande, décrémentation)
    const newOrder = await prisma.$transaction(async (tx: any) => {
      for (const item of items) {
        const pId = String(item.productId || item.id);
        const product = await tx.product.findUnique({
          where: { id: pId },
          select: { name_fr: true, stock: true },
        });

        if (!product) {
          throw new Error(`Le produit sélectionné est introuvable.`);
        }

        if (product.stock < Number(item.quantity)) {
          throw new Error(`Stock insuffisant pour '${product.name_fr}'. Disponible: ${product.stock}`);
        }
      }

      const order = await tx.order.create({
        data: {
          orderNumber,
          clientId: client.id, // Liaison directe avec l'acheteur
          customerName: cleanedName,
          customerPhone: cleanPhone,
          customerEmail: cleanedEmail,
          address: cleanedAddress,
          city: cleanedCity,
          country: "Maroc",
          totalAmount: Number(totalAmount) || 0,
          shippingMode: mode,
          status: "PENDING", // Aligné avec l'Enum OrderStatus (majuscules)
          paymentMethod: paymentMethod || "cash_on_delivery",
          notes: notes && String(notes).trim() !== "" ? String(notes).trim() : undefined,

          delivery: !isStandard ? {
            create: {
              trackingNumber,
              status: "En attente",
              shippingFee: shippingFee ? Number(shippingFee) : 0,
            }
          } : undefined,

          items: {
            create: items.map((item: any) => ({
              productId: String(item.productId || item.id),
              quantity: Number(item.quantity),
              price: Number(item.price),
            })),
          },
        },
        include: {
          client: true,
          delivery: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      await Promise.all(
        items.map((item: any) => {
          const pId = String(item.productId || item.id);
          return tx.product.update({
            where: { id: pId },
            data: {
              stock: {
                decrement: Number(item.quantity),
              },
            },
          });
        })
      );

      return order;
    });

    // 3. MISE À JOUR AUTOMATIQUE DES PRODUITS FAVORIS DU CLIENT (favoriteProducts)
    const allClientOrders = await prisma.order.findMany({
      where: { clientId: client.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    const productCounts: Record<string, { productId: string; name: string; count: number; image?: string }> = {};

    allClientOrders.forEach((ord) => {
      ord.items.forEach((item) => {
        if (!item.product) return;
        const prodId = item.productId;

        if (!productCounts[prodId]) {
          productCounts[prodId] = {
            productId: prodId,
            name: item.product.name_fr,
            count: 0,
            image: item.product.images?.[0] || "",
          };
        }
        productCounts[prodId].count += item.quantity;
      });
    });

    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    await prisma.client.update({
      where: { id: client.id },
      data: {
        favoriteProducts: topProducts as any,
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error("Erreur création commande (API Admin Orders):", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur lors de la création de la commande" }, 
      { status: 400 }
    );
  }
}