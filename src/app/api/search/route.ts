import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ products: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name_ar: { contains: query, mode: "insensitive" } },
          { name_fr: { contains: query, mode: "insensitive" } },
          { description_ar: { contains: query, mode: "insensitive" } },
          { description_fr: { contains: query, mode: "insensitive" } },
          { brand: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: {
          include: {
            department: true,
          },
        },
      },
      take: 20,
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Erreur de recherche :", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la recherche." },
      { status: 500 }
    );
  }
}