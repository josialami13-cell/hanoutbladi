// =============================================================
// API ADMIN - Fiche Client Unique (GET, PATCH, DELETE)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma, ClientType } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

function unauthorizedResponse() {
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}

export async function GET(_request: NextRequest, context: Context) {
  if (!(await isAdmin())) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const client = await prisma.client.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        clientType: true, // Type de client (PARTICULIER, SOCIETE, GROSSISTE)
        latitude: true,   // GPS Latitude
        longitude: true,  // GPS Longitude
        loyaltyPoints: true,
        createdAt: true,
        orders: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            items: {
              select: {
                quantity: true,
                product: { select: { name_fr: true } },
              },
            },
          },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("GET /api/admin/clients/[id]", error);
    return NextResponse.json(
      { error: "Impossible de charger la fiche client." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  if (!(await isAdmin())) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    const values = body as Record<string, unknown>;
    const data: Prisma.ClientUpdateInput = {};

    if ("name" in values) {
      const name = String(values.name ?? "").trim();
      if (!name) {
        return NextResponse.json({ error: "Le nom du client est obligatoire." }, { status: 400 });
      }
      data.name = name;
    }

    if ("phone" in values) {
      const phone = String(values.phone ?? "").trim();
      if (!phone) {
        return NextResponse.json({ error: "Le téléphone du client est obligatoire." }, { status: 400 });
      }
      data.phone = phone;
    }

    if ("email" in values) {
      const email = String(values.email ?? "").trim().toLowerCase();
      data.email = email || null;
    }

    if ("address" in values) {
      const address = String(values.address ?? "").trim();
      data.address = address || null;
    }

    if ("city" in values) {
      const city = String(values.city ?? "").trim();
      data.city = city || null;
    }

    // Gestion du type de client (PARTICULIER, SOCIETE, GROSSISTE)
    if ("clientType" in values) {
      const typeStr = String(values.clientType ?? "").toUpperCase();
      if (Object.values(ClientType).includes(typeStr as ClientType)) {
        data.clientType = typeStr as ClientType;
      } else {
        return NextResponse.json({ error: "Type de client invalide." }, { status: 400 });
      }
    }

    // Gestion de la Latitude GPS
    if ("latitude" in values) {
      const lat = values.latitude !== null && values.latitude !== "" ? Number(values.latitude) : null;
      if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) {
        return NextResponse.json({ error: "Latitude invalide." }, { status: 400 });
      }
      data.latitude = lat;
    }

    // Gestion de la Longitude GPS
    if ("longitude" in values) {
      const lng = values.longitude !== null && values.longitude !== "" ? Number(values.longitude) : null;
      if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) {
        return NextResponse.json({ error: "Longitude invalide." }, { status: 400 });
      }
      data.longitude = lng;
    }

    if ("loyaltyPoints" in values) {
      const points = Number(values.loyaltyPoints);
      if (!Number.isSafeInteger(points) || points < 0) {
        return NextResponse.json(
          { error: "Le solde de points doit être un entier positif ou nul." },
          { status: 400 },
        );
      }
      data.loyaltyPoints = points;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Aucune donnée valide à modifier." }, { status: 400 });
    }

    const client = await prisma.client.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        clientType: true,
        latitude: true,
        longitude: true,
        loyaltyPoints: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, client });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    console.error("PATCH /api/admin/clients/[id]", error);

    if (code === "P2002") {
      return NextResponse.json(
        { error: "Ce téléphone ou cet email est déjà utilisé." },
        { status: 409 },
      );
    }
    if (code === "P2025") {
      return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Impossible de mettre à jour le client." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  if (!(await isAdmin())) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    await prisma.client.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Compte client supprimé." });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    console.error("DELETE /api/admin/clients/[id]", error);

    if (code === "P2025") {
      return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Impossible de supprimer le compte client." },
      { status: 500 },
    );
  }
}