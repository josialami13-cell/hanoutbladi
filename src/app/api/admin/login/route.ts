import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors du chargement des fournisseurs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newSupplier = await prisma.supplier.create({
      data: {
        name: body.name,
        contactPerson: body.contactPerson,
        phone: body.phone,
        city: body.city,
        speciality: body.speciality,
      },
    });
    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la création du fournisseur" }, { status: 500 });
  }
}