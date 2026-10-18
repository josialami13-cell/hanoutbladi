import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET : جلب الزبناء مع الفلاتر
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const city = searchParams.get("city") || "";

    const clients = await prisma.client.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { phone: { contains: search, mode: "insensitive" } },
                  { city: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          type ? { clientType: type as any } : {},
          city ? { city: { equals: city, mode: "insensitive" } } : {},
        ],
      },
      include: {
        _count: { select: { orders: true } },
        orders: { select: { totalAmount: true, country: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const availableCities = Array.from(new Set(clients.map((c) => c.city).filter(Boolean)));

    const formattedClients = clients.map((client) => {
      const totalSpent = client.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const clientCountry = client.orders[0]?.country || "Maroc";

      return {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        country: clientCountry,
        city: client.city || "Non spécifiée",
        address: client.address,
        latitude: client.latitude,
        longitude: client.longitude,
        clientType: client.clientType,
        loyaltyPoints: client.loyaltyPoints,
        ordersCount: client._count.orders,
        totalSpent,
        createdAt: client.createdAt,
      };
    });

    return NextResponse.json({ clients: formattedClients, availableCities });
  } catch (error) {
    console.error("Erreur GET /api/admin/clients:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST : إضافة كليون جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, city, address, clientType, latitude, longitude } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Le nom et le téléphone sont obligatoires" }, { status: 400 });
    }

    const newClient = await prisma.client.create({
      data: {
        name,
        phone: phone.trim(),
        email: email || null,
        city: city || null,
        address: address || null,
        clientType: clientType || "PARTICULIER",
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    return NextResponse.json({ success: true, client: newClient }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/admin/clients:", error);
    return NextResponse.json({ error: "Erreur lors de la création du client" }, { status: 500 });
  }
}

// PUT : تعديل بيانات كليون
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, phone, email, city, address, clientType, latitude, longitude } = body;

    if (!id) {
      return NextResponse.json({ error: "ID du client requis" }, { status: 400 });
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name,
        phone: phone.trim(),
        email: email || null,
        city: city || null,
        address: address || null,
        clientType: clientType || "PARTICULIER",
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    return NextResponse.json({ success: true, client: updatedClient });
  } catch (error) {
    console.error("Erreur PUT /api/admin/clients:", error);
    return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 });
  }
}

// DELETE : حذف كليون
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID du client requis" }, { status: 400 });
    }

    await prisma.client.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/admin/clients:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}