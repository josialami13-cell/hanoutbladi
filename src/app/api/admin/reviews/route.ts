import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const isAdmin = async () => (await getServerSession(authOptions))?.user?.role === "ADMIN";
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const status = new URL(request.url).searchParams.get("status") || "PENDING";
  const reviews = await prisma.productReview.findMany({
    where: { status },
    include: { client: { select: { id: true, name: true, phone: true } }, product: { select: { id: true, name_fr: true, slug: true, images: true } }, order: { select: { id: true, orderNumber: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews);
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const body = await request.json();
    const status = String(body.status || "").toUpperCase();
    if (!body.id || !["APPROVED", "REJECTED"].includes(status)) return NextResponse.json({ error: "Action d’avis invalide." }, { status: 400 });
    const review = await prisma.productReview.update({ where: { id: String(body.id) }, data: { status } });
    const summary = await prisma.productReview.aggregate({
      where: { productId: review.productId, status: "APPROVED" },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await prisma.product.update({
      where: { id: review.productId },
      data: { rating: summary._avg.rating || 0, reviewsCount: summary._count._all },
    });
    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("PATCH /api/admin/reviews", error);
    return NextResponse.json({ error: "Impossible de modérer cet avis." }, { status: 400 });
  }
}
