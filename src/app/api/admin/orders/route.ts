// =============================================================
// API ADMIN COMMANDES - Routes GET & POST (Corrigé Multi-produits & Stocks)
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
    const unassigned = searchParams.get("unassigned");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    if (unassigned === "true") {
      where.delivery = { is: null };
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
        client: {
          select: { id: true, name: true, phone: true, email: true, address: true, city: true, loyaltyPoints: true },
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

// --- POST : Création sécurisée de commande par l'Admin (Multi-produits consolidé) ---
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

    // 💡 Consolidation des quantités par ID de produit (évite les doublons et conflits de stock)
    const aggregatedItemsMap: Record<string, { productId: string; quantity: number; price: number }> = {};
    for (const rawItem of items) {
      const pId = String(rawItem.productId || rawItem.id);
      const qty = Number(rawItem.quantity) || 0;
      const prc = Number(rawItem.price) || 0;

      if (!pId) continue;

      if (aggregatedItemsMap[pId]) {
        aggregatedItemsMap[pId].quantity += qty;
      } else {
        aggregatedItemsMap[pId] = { productId: pId, quantity: qty, price: prc };
      }
    }

    const consolidatedItems = Object.values(aggregatedItemsMap);
    if (consolidatedItems.length === 0) {
      return NextResponse.json({ error: "Aucun produit valide dans le panier" }, { status: 400 });
    }

    const cleanPhone = String(customerPhone).trim().replace(/\s+/g, "");
    const cleanedName = String(customerName).trim();
    const cleanedEmail = customerEmail && String(customerEmail).trim() !== "" ? String(customerEmail).trim() : null;
    const cleanedAddress = String(address).trim();
    const cleanedCity = String(city).trim();
    const mode = shippingMode || "standard";

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

    const earnedPoints = Math.floor(Number(totalAmount) / 10);

    // 1. GESTION DE LA TABLE CLIENT
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
          loyaltyPoints: 0,
        },
      });
    }

    // 2. TRANSACTION PRISMA (Vérification des stocks consolidés, création, décrémentation)
    const newOrder = await prisma.$transaction(async (tx: any) => {
      // Vérification des stocks pour chaque produit unique
      for (const item of consolidatedItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { name_fr: true, stock: true },
        });

        if (!product) {
          throw new Error(`Le produit sélectionné est introuvable.`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Stock insuffisant pour '${product.name_fr}'. Demandé: ${item.quantity}, Disponible: ${product.stock}`);
        }
      }

      // Création de la commande et des OrderItems associés
      const order = await tx.order.create({
        data: {
          orderNumber,
          clientId: client.id,
          userId: (session?.user as any)?.id,
          customerName: cleanedName,
          customerPhone: cleanPhone,
          customerEmail: cleanedEmail,
          address: cleanedAddress,
          city: cleanedCity,
          country: "Maroc",
          totalAmount: Number(totalAmount) || 0,
          shippingMode: mode,
          status: "PENDING",
          paymentMethod: paymentMethod || "cash_on_delivery",
          notes: notes && String(notes).trim() !== "" ? String(notes).trim() : undefined,

          delivery: {
            create: {
              trackingNumber,
              status: "En attente",
              shippingFee: shippingFee ? Number(shippingFee) : 0,
            }
          },

          items: {
            create: consolidatedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
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

      // Décrémentation propre des stocks pour chaque article consolidé
      for (const item of consolidatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Créditer les points de fidélité
      await tx.client.update({
        where: { id: client.id },
        data: {
          loyaltyPoints: {
            increment: earnedPoints,
          },
        },
      });

      return order;
    });

    // 3. MISE À JOUR DES PRODUITS FAVORIS DU CLIENT
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