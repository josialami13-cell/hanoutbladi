import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      include: {
        categories: {
          where: { isActive: true },
          include: {
            products: {
              where: { isActive: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(departments, { status: 200 });
  } catch (error: any) {
    console.error("Erreur API catalogue public:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}