// =============================================================
// API CLIENT - Commandes et Produits Favoris de l'acheteur
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à vos données." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const rawPhone = (session.user as any).phone;

    if (!userId && !rawPhone) {
      return NextResponse.json(
        { error: "Identifiant utilisateur introuvable." },
        { status: 400 }
      );
    }

    // Normalisation flexible des formats de téléphone pour la recherche
    const phoneQueries: string[] = [];
    if (rawPhone) {
      const clean = String(rawPhone).trim().replace(/\s+/g, "");
      phoneQueries.push(clean);
      if (clean.startsWith("+")) {
        phoneQueries.push(clean.replace("+", ""));
      } else {
        phoneQueries.push("+" + clean);
      }
      if (clean.startsWith("+212")) {
        phoneQueries.push("0" + clean.slice(4));
      } else if (clean.startsWith("0")) {
        phoneQueries.push("+212" + clean.slice(1));
      }
    }

    // Recherche sécurisée des commandes par clientId ou variantes de customerPhone
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          ...(userId ? [{ clientId: userId }] : []),
          ...phoneQueries.map((p) => ({ customerPhone: p })),
        ],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name_fr: true,
                name_ar: true,
                slug: true,
                images: true,
                price: true,
              },
            },
          },
        },
        delivery: {
          select: {
            status: true,
            trackingNumber: true,
            shippingFee: true,
            deliveredAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calcul automatique des produits favoris (les plus commandés)
    const productCounts: { [key: string]: { product: any; totalQty: number } } = {};
    
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product) {
          if (!productCounts[item.productId]) {
            productCounts[item.productId] = {
              product: item.product,
              totalQty: 0,
            };
          }
          productCounts[item.productId].totalQty += item.quantity;
        }
      });
    });

    // Transformer en tableau trié par quantité achetée décroissante
    const favoriteProducts = Object.values(productCounts)
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 4) // Garder les 4 grands favoris
      .map((item) => item.product);

    return NextResponse.json({ orders, favoriteProducts }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur GET /api/client/orders:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de vos données." },
      { status: 500 }
    );
  }
}