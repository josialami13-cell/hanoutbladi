"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiBox, FiAlertTriangle, FiRefreshCw, FiEdit3 } from "react-icons/fi";

interface Department {
  id: string;
  name_fr: string;
}

interface Category {
  id: string;
  name_fr: string;
  departmentId?: string;
}

interface StoreProduct {
  id: string;
  name_fr: string;
  sku?: string | null;
  price: number;
  stock: number;
  minStockAlert?: number | null;
  categoryId?: string | null;
  category?: {
    name_fr?: string;
    departmentId?: string;
    department?: {
      name_fr?: string;
    };
  } | null;
}

export default function StoresAdminPage() {
  const { status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  
  // États des filtres
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "low" | "out">("all");
  
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [newAlertValue, setNewAlertValue] = useState<number>(5);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, deptRes, catRes] = await Promise.all([
        fetch("/api/admin/stores").catch(() => null),
        fetch("/api/admin/departments").catch(() => null),
        fetch("/api/admin/categories").catch(() => null)
      ]);

      if (prodRes && prodRes.ok) {
        const data = await prodRes.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      }
      if (deptRes && deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(Array.isArray(data) ? data : []);
      }
      if (catRes && catRes.ok) {
        const data = await catRes.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const handleUpdateStock = async (productId: string) => {
    try {
      const res = await fetch("/api/admin/stores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          stock: Number(newStockValue),
          minStockAlert: Number(newAlertValue),
        }),
      });

      if (res.ok) {
        toast.success("Stock mis à jour avec succès !");
        setEditingProductId(null);
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      toast.error("Erreur serveur");
    }
  };

  // Filtrer les catégories dynamiquement en fonction du département choisi
  const filteredCategories = selectedDept === "all" 
    ? categories 
    : categories.filter((c) => c.departmentId === selectedDept);

  // Filtrage global
  const filteredProducts = products.filter((p) => {
    const matchesDept = selectedDept === "all" || p.category?.departmentId === selectedDept;
    const matchesCat = selectedCat === "all" || p.categoryId === selectedCat;
    
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (p.name_fr || "").toLowerCase().includes(term) ||
      (p.sku && p.sku.toLowerCase().includes(term));

    const minAlert = p.minStockAlert ?? 5;
    const isOut = p.stock <= 0;
    const isLow = p.stock > 0 && p.stock <= minAlert;

    let matchesStatus = true;
    if (filterType === "out") matchesStatus = isOut;
    if (filterType === "low") matchesStatus = isLow;

    return matchesDept && matchesCat && matchesSearch && matchesStatus;
  });

  const totalProducts = products.length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= (p.minStockAlert ?? 5)).length;

  if (status === "loading" || loading) {
    return <div className="p-12 text-center text-gray-400 font-medium">Chargement des données de stock...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">📦 Gestion des Stocks & Entrepôts (Stores)</h1>
          <p className="text-xs text-gray-500 mt-1">Filtrez par département, catégorie ou recherchez un produit.</p>
        </div>
        <button
          onClick={fetchData}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
        >
          <FiRefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* Cartes de statistiques cliquables */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setFilterType("all")}
          className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 cursor-pointer transition ${
            filterType === "all" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FiBox size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Total Produits</p>
            <p className="text-xl font-extrabold text-gray-900">{totalProducts}</p>
          </div>
        </div>

        <div 
          onClick={() => setFilterType("low")}
          className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 cursor-pointer transition ${
            filterType === "low" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FiAlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Stock Alerte / Faible</p>
            <p className="text-xl font-extrabold text-amber-600">{lowStockCount}</p>
          </div>
        </div>

        <div 
          onClick={() => setFilterType("out")}
          className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 cursor-pointer transition ${
            filterType === "out" ? "border-rose-500 ring-2 ring-rose-500/20" : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <FiAlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">En Rupture</p>
            <p className="text-xl font-extrabold text-rose-600">{outOfStockCount}</p>
          </div>
        </div>
      </div>

      {/* Barre de filtres en cascade */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <input
            type="text"
            placeholder="Nom ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tableau du Stock */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">Aucun produit ne correspond à vos critères de recherche.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 px-6 font-bold">Produit</th>
                  <th className="py-3 px-6 font-bold">Département / Catégorie</th>
                  <th className="py-3 px-6 font-bold">Prix (MAD)</th>
                  <th className="py-3 px-6 font-bold">Stock Actuel</th>
                  <th className="py-3 px-6 font-bold">Seuil Alerte</th>
                  <th className="py-3 px-6 font-bold">État Stock</th>
                  <th className="py-3 px-6 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredProducts.map((prod) => {
                  const isEditing = editingProductId === prod.id;
                  const minAlert = prod.minStockAlert ?? 5;
                  const isOut = prod.stock <= 0;
                  const isLow = prod.stock > 0 && prod.stock <= minAlert;

                  return (
                    <tr key={prod.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {prod.name_fr}
                        <div className="text-[10px] text-gray-400 font-normal">SKU: {prod.sku || "N/A"}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        <span className="font-semibold">{prod.category?.department?.name_fr || "-"}</span>
                        <div className="text-[10px] text-gray-400">{prod.category?.name_fr || "-"}</div>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-emerald-600">{prod.price} MAD</td>
                      
                      <td className="py-4 px-6">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={newStockValue}
                            onChange={(e) => setNewStockValue(Number(e.target.value))}
                            className="w-20 bg-white border border-emerald-500 rounded-lg px-2 py-1 text-sm font-bold outline-none"
                          />
                        ) : (
                          <span className="font-extrabold text-sm">{prod.stock}</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={newAlertValue}
                            onChange={(e) => setNewAlertValue(Number(e.target.value))}
                            className="w-20 bg-white border border-gray-300 rounded-lg px-2 py-1 text-sm outline-none"
                          />
                        ) : (
                          <span className="text-gray-500">{minAlert}</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {isOut ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                            Rupture
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            Stock Faible
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                            En stock
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateStock(prod.id)}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition cursor-pointer"
                            >
                              Enregistrer
                            </button>
                            <button
                              onClick={() => setEditingProductId(null)}
                              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg font-bold text-xs hover:bg-gray-300 transition cursor-pointer"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingProductId(prod.id);
                              setNewStockValue(prod.stock);
                              setNewAlertValue(prod.minStockAlert ?? 5);
                            }}
                            className="p-2 bg-stone-100 hover:bg-emerald-100 hover:text-emerald-700 text-stone-700 rounded-xl transition cursor-pointer inline-flex items-center gap-1 font-bold"
                            title="Modifier le stock"
                          >
                            <FiEdit3 size={14} /> Modifier
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}