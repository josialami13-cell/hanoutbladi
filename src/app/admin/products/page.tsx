// =============================================================
// PAGE ADMIN - Gestion des Produits & Formulaire d'Ajout (avec Upload PC)
// =============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiSearch, FiPlus, FiRefreshCw } from "react-icons/fi";

interface Product {
  id: string;
  name_fr: string;
  name_ar: string;
  sku?: string;
  price: number;
  loyaltyPoints?: number;
  discount?: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  promotionalBadge: string | null;
  unit: string | null;
  weight: number | null;
  categoryId: string;
  category: {
    id: string;
    name_fr: string;
    departmentId?: string;
    department?: {
      id: string;
      name_fr: string;
    } | null;
  } | null;
  images: string[];
}

interface Department {
  id: string;
  name_fr: string;
}

interface Category {
  id: string;
  name_fr: string;
  departmentId: string;
}

export default function AdminProductsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // États des filtres
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAllData();
    }
  }, [status]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [prodRes, deptRes, catRes] = await Promise.all([
        fetch("/api/admin/products?active=all"),
        fetch("/api/admin/departments"),
        fetch("/api/admin/categories"),
      ]);

      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(Array.isArray(data) ? data : []);
      }
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(Array.isArray(data) ? data : []);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        const cats = Array.isArray(data) ? data : Array.isArray(data?.categories) ? data.categories : [];
        setCategories(cats);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Produit supprimé !");
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error("Erreur de suppression");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  // Filtrer les catégories selon le département sélectionné
  const filteredCategories = selectedDept === "all"
    ? categories
    : categories.filter((c) => c.departmentId === selectedDept);

  // Filtrage combiné : Département -> Catégorie -> Recherche Produit
  const filteredProducts = (products || []).filter((product) => {
    const matchesDept = selectedDept === "all" || product.category?.departmentId === selectedDept;
    const matchesCat = selectedCat === "all" || product.categoryId === selectedCat;

    const term = searchTerm.toLowerCase();
    const nameFr = product.name_fr?.toLowerCase() || "";
    const nameAr = product.name_ar || "";
    const sku = product.sku?.toLowerCase() || "";

    const matchesSearch = nameFr.includes(term) || nameAr.includes(term) || sku.includes(term);

    return matchesDept && matchesCat && matchesSearch;
  });

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 font-medium">
        Chargement des produits...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Produits</h1>
          <p className="text-xs text-gray-500 mt-1">
            Total : {filteredProducts.length} sur {products.length} produit(s) affiché(s)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <FiRefreshCw size={14} /> Actualiser
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <FiPlus size={18} /> {showForm ? "Fermer le formulaire" : "Ajouter un produit complet"}
          </button>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Filtrer par Département</label>
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedCat("all");
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Tous les départements</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name_fr}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Filtrer par Catégorie</label>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Toutes les catégories</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_fr}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Rechercher par Produit</label>
          <div className="relative flex items-center">
            <FiSearch className="absolute left-3 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom ou SKU..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {showForm && (
        <ProductForm
          onSuccess={() => {
            setShowForm(false);
            fetchAllData();
          }}
        />
      )}

      {/* Tableau des produits */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Image</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Nom (FR)</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Département</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Catégorie</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Prix</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Points / unité</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Stock</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Statut</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product) => {
              const primaryImage = product.images?.[0] || "";
              return (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      {primaryImage && (
                        <img src={primaryImage} alt={product.name_fr} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    {product.name_fr}
                    <div className="text-[10px] text-gray-400 font-normal">SKU: {product.sku || "N/A"}</div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-amber-700">
                    {product.category?.department?.name_fr || "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 font-medium">
                    {product.category?.name_fr || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-extrabold text-emerald-600">
                    {product.price} MAD
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-amber-700">{product.loyaltyPoints || 0} pts</td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {product.stock} <span className="text-xs text-gray-400">({product.unit || "unité"})</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg transition"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name_fr)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Aucun produit ne correspond à vos critères de recherche.
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================
// COMPOSANT FORMULAIRE D'AJOUT AVEC UPLOAD DEPUIS LE PC
// =============================================================
function ProductForm({ onSuccess }: { onSuccess: () => void }) {
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
  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
        else if (Array.isArray(data?.categories)) setCategories(data.categories);
        else setCategories([]);
      })
      .catch(() => setCategories([]));
  }, []);

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[éèê]/g, "e")
      .replace(/[àâ]/g, "a")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  // Gestion du téléchargement d'image depuis le PC
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

      const res = await fetch("/api/products", {
        method: "POST",
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
          slug: formData.slug || generateSlug(formData.name_fr),
        }),
      });

      if (res.ok) {
        toast.success("Produit créé avec succès !");
        onSuccess();
      } else {
        const error = await res.json();
        toast.error(error.error || "Erreur de création");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
      <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Ajouter un nouveau produit complet</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Nom (FR) *</label>
          <input
            type="text"
            value={formData.name_fr}
            onChange={(e) =>
              setFormData({
                ...formData,
                name_fr: e.target.value,
                slug: generateSlug(e.target.value),
              })
            }
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
                {cat.name_fr} {cat.department ? `(${cat.department.name_fr})` : ""}
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
          <p className="mt-1 text-[10px] text-gray-500">Saisissez le total à gagner pour ce produit, boost inclus.</p>
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
          <label className="block text-xs font-semibold mb-1">Unité (ex: Pot, Kg, Pièce)</label>
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
            placeholder="Ex: 1.0"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Badge promo</label>
          <input
            type="text"
            value={formData.promotionalBadge}
            onChange={(e) => setFormData({ ...formData, promotionalBadge: e.target.value })}
            className="w-full p-2.5 border rounded-xl text-sm"
            placeholder="ex: Bio, -20%"
          />
        </div>

        {/* SECTION UPLOAD D'IMAGE DEPUIS LE PC */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-xs font-semibold mb-1">Image du produit (Importer depuis le PC)</label>
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
            placeholder="URLs des images (remplies automatiquement via l'upload ou saisie manuelle)"
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
            <span className="text-sm font-medium text-gray-700">Actif (visible sur le site)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">En vedette (coup de cœur)</span>
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

        <div className="md:col-span-3 pt-2">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Enregistrement..." : "Enregistrer le produit"}
          </button>
        </div>
      </form>
    </div>
  );
}
