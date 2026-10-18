import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const isAdmin = async () => (await getServerSession(authOptions))?.user?.role === "ADMIN";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const bundles = await prisma.productBundle.findMany({ include: { items: { include: { product: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(bundles);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const discountPercent = Number(body.discountPercent);
    if (!String(body.name_fr || "").trim() || items.length === 0 || !Number.isFinite(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json({ error: "Indiquez le nom, au moins un produit et une remise entre 1 et 100 %." }, { status: 400 });
    }
    const bundle = await prisma.productBundle.create({
      data: {
        name_fr: String(body.name_fr).trim(),
        name_ar: body.name_ar ? String(body.name_ar).trim() : null,
        slug: slugify(String(body.slug || body.name_fr)),
        description_fr: body.description_fr ? String(body.description_fr).trim() : null,
        image: body.image ? String(body.image).trim() : null,
        discountPercent,
        isActive: body.isActive !== false,
        items: { create: items.map((item: any) => ({ productId: String(item.productId), quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)) })) },
      },
      include: { items: { include: { product: true } } },
    });
    return NextResponse.json(bundle, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/bundles", error);
    return NextResponse.json({ error: error.code === "P2002" ? "Ce slug de pack existe déjà." : "Impossible de créer le pack." }, { status: 400 });
  }
}
