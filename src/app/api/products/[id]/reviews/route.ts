import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };
const deliveredStatuses = ["DELIVERED", "PAID"] as const;

export async function GET(_request: NextRequest, context: Context) {
  try {
    const { id: productId } = await context.params;
    const reviews = await prisma.productReview.findMany({
      where: { productId, status: "APPROVED" },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    const session = await getServerSession(authOptions);
    const clientId = (session?.user as any)?.role === "CLIENT" ? (session?.user as any).id : null;
    const eligibleOrders = clientId ? await prisma.order.findMany({
      where: {
        clientId,
        status: { in: [...deliveredStatuses] as any },
        items: { some: { productId } },
        reviews: { none: { productId } },
      },
      select: { id: true, orderNumber: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }) : [];
    return NextResponse.json({
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        author: `${review.client.name.split(" ")[0]} · Achat vérifié`,
      })),
      eligibleOrders,
    });
  } catch (error) {
    console.error("GET product reviews", error);
    return NextResponse.json({ error: "Impossible de charger les avis." }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: Context) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "CLIENT" || !(session?.user as any)?.id) {
      return NextResponse.json({ error: "Connectez-vous pour laisser un avis." }, { status: 401 });
    }
    const { id: productId } = await context.params;
    const body = await request.json();
    const rating = Number(body.rating);
    const comment = String(body.comment || "").trim();
    const orderId = String(body.orderId || "");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length > 1500 || !orderId) {
      return NextResponse.json({ error: "Choisissez une note, une commande livrée et un commentaire de 1 500 caractères maximum." }, { status: 400 });
    }
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        clientId: (session?.user as any).id,
        status: { in: [...deliveredStatuses] as any },
        items: { some: { productId } },
      },
      select: { id: true },
    });
    if (!order) return NextResponse.json({ error: "Seul l’acheteur d’une commande livrée peut évaluer ce produit." }, { status: 403 });
    const review = await prisma.productReview.create({
      data: { productId, clientId: (session?.user as any).id, orderId, rating, comment: comment || null },
    });
    return NextResponse.json({ success: true, message: "Merci ! Votre avis sera publié après vérification." , reviewId: review.id }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") return NextResponse.json({ error: "Vous avez déjà envoyé un avis pour ce produit et cette commande." }, { status: 409 });
    console.error("POST product review", error);
    return NextResponse.json({ error: "Impossible d’enregistrer votre avis." }, { status: 500 });
  }
}
