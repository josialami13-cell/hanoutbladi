import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- GET : Récupérer tous les livreurs ---
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const deliveryMen = await prisma.deliveryMan.findMany({
      include: {
        _count: {
          select: { deliveries: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(deliveryMen);
  } catch (error) {
    console.error("Erreur GET /api/admin/delivery-men:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des livreurs" },
      { status: 500 }
    );
  }
}

// --- POST : Créer un nouveau livreur ---
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, zone, vehicle, status } = body;

    if (!fullName || !String(fullName).trim() || !phone || !String(phone).trim()) {
      return NextResponse.json(
        { error: "Le nom complet et le numéro de téléphone sont obligatoires." },
        { status: 400 }
      );
    }

    const newDeliveryMan = await prisma.deliveryMan.create({
      data: {
        fullName: String(fullName).trim(),
        phone: String(phone).trim(),
        zone: zone ? String(zone).trim() : "Settat",
        // CORRECTION ICI : Remplacement de null par undefined pour TypeScript/Prisma
        vehicle: vehicle && String(vehicle).trim() !== "" ? String(vehicle).trim() : undefined,
        status: status ? String(status).trim() : "Disponible",
      },
    });

    return NextResponse.json(newDeliveryMan, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST /api/admin/delivery-men:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Un livreur avec ce numéro de téléphone existe déjà." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du livreur" },
      { status: 500 }
    );
  }
}