import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  const products = query.trim()
    ? await prisma.product.findMany({
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
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Résultats de recherche pour : <span className="text-emerald-600">"{query}"</span>
      </h1>

      {products.length === 0 ? (
        <p className="text-gray-500 mt-4">Aucun produit trouvé pour votre recherche.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {products.map((product) => {
            const deptName =
              product.category?.department?.name_fr ||
              product.category?.department?.name_ar;
            const catName =
              product.category?.name_fr || product.category?.name_ar;

            return (
              <div
                key={product.id}
                className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs text-emerald-600 font-semibold uppercase">
                    {deptName} &gt; {catName}
                  </span>
                  <h2 className="text-lg font-bold text-gray-800 mt-1">
                    {product.name_fr || product.name_ar}
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {product.description_fr || product.description_ar}
                  </p>
                </div>

                <div className="mt-4 flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-bold text-emerald-700">
                    {product.price} DH
                  </span>
                  <Link
                    href={`/products/${product.slug}`}
                    className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700 transition-colors"
                  >
                    Voir produit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}