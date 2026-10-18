// =============================================================
// API ADMIN FOURNISSEURS - Routes GET & POST
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer tous les fournisseurs ---
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: any = {};
    if (search && search.trim() !== "") {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { contactPerson: { contains: term, mode: "insensitive" } },
        { phone: { contains: term, mode: "insensitive" } },
        { city: { contains: term, mode: "insensitive" } },
        { speciality: { contains: term, mode: "insensitive" } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        _count: {
          select: { purchases: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(suppliers);
  } catch (error: any) {
    console.error("Erreur GET /api/admin/suppliers:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des fournisseurs" },
      { status: 500 }
    );
  }
}

// --- POST : Créer un nouveau fournisseur ---
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, contactPerson, phone, city, speciality } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: "Le nom du fournisseur est obligatoire." },
        { status: 400 }
      );
    }

    const newSupplier = await prisma.supplier.create({
      data: {
        name: String(name).trim(),
        contactPerson: contactPerson && String(contactPerson).trim() !== "" ? String(contactPerson).trim() : undefined,
        phone: phone && String(phone).trim() !== "" ? String(phone).trim() : undefined,
        city: city && String(city).trim() !== "" ? String(city).trim() : undefined,
        speciality: speciality && String(speciality).trim() !== "" ? String(speciality).trim() : undefined,
      },
    });

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST /api/admin/suppliers:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Un fournisseur avec ces informations existe déjà." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du fournisseur" },
      { status: 500 }
    );
  }
}