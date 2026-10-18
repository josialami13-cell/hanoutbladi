import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET : Récupérer un fournisseur par son ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
    });
    if (!supplier) {
      return NextResponse.json({ error: "Fournisseur non trouvé" }, { status: 404 });
    }
    return NextResponse.json(supplier);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT : Mettre à jour un fournisseur par son ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updatedSupplier = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        name: body.name,
        contactPerson: body.contactPerson,
        phone: body.phone,
        city: body.city,
        speciality: body.speciality,
      },
    });
    return NextResponse.json(updatedSupplier);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour du fournisseur" }, { status: 500 });
  }
}

// DELETE : Supprimer un fournisseur par son ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.supplier.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression du fournisseur" }, { status: 500 });
  }
}