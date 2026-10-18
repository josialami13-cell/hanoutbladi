import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const isAdmin = async () => (await getServerSession(authOptions))?.user?.role === "ADMIN";
type Context = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: Context) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const { id } = await context.params;
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const discountPercent = Number(body.discountPercent);
    if (!String(body.name_fr || "").trim() || items.length === 0 || !Number.isFinite(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json({ error: "Indiquez le nom, au moins un produit et une remise entre 1 et 100 %." }, { status: 400 });
    }
    const bundle = await prisma.productBundle.update({
      where: { id },
      data: {
        name_fr: String(body.name_fr).trim(),
        name_ar: body.name_ar ? String(body.name_ar).trim() : null,
        slug: slugify(String(body.slug || body.name_fr)),
        description_fr: body.description_fr ? String(body.description_fr).trim() : null,
        image: body.image ? String(body.image).trim() : null,
        discountPercent,
        isActive: Boolean(body.isActive),
        items: {
          deleteMany: {},
          create: items.map((item: any) => ({ productId: String(item.productId), quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)) })),
        },
      },
      include: { items: { include: { product: true } } },
    });
    return NextResponse.json(bundle);
  } catch (error: any) {
    console.error("PUT /api/admin/bundles/[id]", error);
    return NextResponse.json({ error: error.code === "P2002" ? "Ce slug de pack existe déjà." : "Impossible de modifier le pack." }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const { id } = await context.params;
    await prisma.productBundle.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/bundles/[id]", error);
    return NextResponse.json({ error: "Impossible de supprimer le pack." }, { status: 400 });
  }
}
