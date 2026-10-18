import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bundles = await prisma.productBundle.findMany({
      where: { isActive: true },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      bundles.filter((bundle) => bundle.items.length > 0 && bundle.items.every((item) => item.product.isActive && item.product.stock >= item.quantity)),
    );
  } catch (error) {
    console.error("GET /api/bundles", error);
    return NextResponse.json({ error: "Impossible de charger les packs." }, { status: 500 });
  }
}
