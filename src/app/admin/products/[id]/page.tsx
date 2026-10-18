// =============================================================
// PAGE ADMIN - Modifier un produit (avec Upload d'image depuis le PC)
// =============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function EditProductPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name_fr: "",
    name_ar: "",
    slug: "",
    description_fr: "",
    description_ar: "",
    price: "",
    discount: "",
    loyaltyPoints: "0",
    images: "",
    stock: "0",
    minStockAlert: "5",
    unit: "Pièce",
    weight: "",
    promotionalBadge: "",
    categoryId: "",
    isActive: true,
    isFeatured: false,
    isPickup: true,
    isBoutique: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && id) {
      Promise.all([
        fetch("/api/categories").then((res) => res.json()),
        fetch(`/api/admin/products/${id}`).then((res) => res.json()),
      ])
        .then(([catData, prodData]) => {
          if (Array.isArray(catData)) setCategories(catData);
          else if (Array.isArray(catData?.categories)) setCategories(catData.categories);

          if (prodData) {
            setFormData({
              name_fr: prodData.name_fr || "",
              name_ar: prodData.name_ar || "",
              slug: prodData.slug || "",
              description_fr: prodData.description_fr || "",
              description_ar: prodData.description_ar || "",
              price: prodData.price ? String(prodData.price) : "",
              discount: prodData.discount ? String(prodData.discount) : "",
              loyaltyPoints: String(prodData.loyaltyPoints || 0),
              images: Array.isArray(prodData.images) ? prodData.images.join(", ") : prodData.image || "",
              stock: prodData.stock !== undefined ? String(prodData.stock) : "0",
              minStockAlert: prodData.minStockAlert !== undefined ? String(prodData.minStockAlert) : "5",
              unit: prodData.unit || "Pièce",
              weight: prodData.weight ? String(prodData.weight) : "",
              promotionalBadge: prodData.promotionalBadge || "",
              categoryId: prodData.categoryId || "",
              isActive: prodData.isActive ?? true,
              isFeatured: prodData.isFeatured ?? false,
              isPickup: prodData.isPickup ?? true,
              isBoutique: prodData.isBoutique ?? true,
            });
          }
        })
        .catch(() => toast.error("Erreur lors du chargement des données"))
        .finally(() => setLoading(false));
    }
  }, [status, id]);

  // Gestion du téléchargement d'une nouvelle image depuis le PC
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.set("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        const result = await res.json();
        setFormData((prev) => ({
          ...prev,
          images: prev.images ? `${prev.images}, ${result.url}` : result.url,
        }));
        toast.success("Image téléchargée depuis le PC avec succès !");
      } else {
        toast.error("Erreur lors du téléchargement de l'image.");
      }
    } catch (err) {
      toast.error("Erreur serveur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const imagesArray = formData.images
        ? formData.images.split(",").map((img) => img.trim()).filter(Boolean)
        : [];

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          discount: formData.discount ? parseFloat(formData.discount) : 0,
          loyaltyPoints: parseInt(formData.loyaltyPoints, 10) || 0,
          stock: parseInt(formData.stock, 10),
          minStockAlert: parseInt(formData.minStockAlert, 10) || 5,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          images: imagesArray,
        }),
      });

      if (res.ok) {
        toast.success("Produit mis à jour avec succès !");
        router.push("/admin/products");
      } else {
        const error = await res.json();
        toast.error(error.error || "Erreur lors de la mise à jour");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Chargement du produit...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 font-medium"
        >
          <FiArrowLeft /> Retour aux produits
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Modifier le Produit</h1>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Nom (FR) *</label>
            <input
              type="text"
              value={formData.name_fr}
              onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
              className="w-full p-2.5 border rounded-xl text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Nom (AR)</label>
            <input
              type="text"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              className="w-full p-2.5 border rounded-xl text-sm"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Catégorie *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full p-2.5 border rounded-xl text-sm"
              required
            >
              <option value="">-- Choisir une catégorie --</option>
              {(categories || []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_fr}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Prix (MAD) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-2.5 border rounded-xl text-sm"
              required
            />
          </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Remise / Discount</label>
          <input
            type="number"
            step="0.01"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            className="w-full p-2.5 border rounded-xl text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Points fidélité par unité</label>
          <input
            type="number"
            min="0"
            step="1"
            value={formData.loyaltyPoints}
            onChange={(e) => setFormData({ ...formData, loyaltyPoints: e.target.value })}
            className="w-full p-2.5 border rounded-xl text-sm"
          />
          <p className="mt-1 text-[10px] text-gray-500">Valeur finale gagnée par produit, bonus boost inclus.</p>
        </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Stock *</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full p-2.5 border rounded-xl text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Alerte Stock Min</label>
            <input
              type="number"
              value={formData.minStockAlert}
              onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
              className="w-full p-2.5 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Unité</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full p-2.5 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Poids (en kg)</label>
            <input
              type="number"
              step="0.01"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full p-2.5 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Badge promo</label>
            <input
              type="text"
              value={formData.promotionalBadge}
              onChange={(e) => setFormData({ ...formData, promotionalBadge: e.target.value })}
              className="w-full p-2.5 border rounded-xl text-sm"
            />
          </div>

          {/* SECTION UPLOAD D'IMAGE DEPUIS LE PC */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-semibold mb-1">Image du produit (Ajouter une nouvelle image depuis le PC)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer border border-gray-200 rounded-xl p-1 bg-gray-50"
            />
            {uploading && <p className="text-[10px] text-amber-600 font-medium">Téléchargement vers le serveur en cours...</p>}
            
            <input
              type="text"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              className="w-full p-2.5 border rounded-xl text-sm"
              placeholder="URLs des images"
            />
          </div>

          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Description (FR)</label>
              <textarea
                value={formData.description_fr}
                onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                className="w-full p-2.5 border rounded-xl text-sm"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Description (AR)</label>
              <textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                className="w-full p-2.5 border rounded-xl text-sm"
                dir="rtl"
                rows={2}
              />
            </div>
          </div>

          <div className="md:col-span-3 flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Actif</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">En vedette</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPickup}
                onChange={(e) => setFormData({ ...formData, isPickup: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Retrait magasin</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isBoutique}
                onChange={(e) => setFormData({ ...formData, isBoutique: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">En boutique</span>
            </label>
          </div>

          <div className="md:col-span-3 pt-4">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Mise à jour..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
