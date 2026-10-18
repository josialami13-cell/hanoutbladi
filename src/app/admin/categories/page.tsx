"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiSearch, FiPlus, FiFolder, FiRefreshCw } from "react-icons/fi";

interface Category {
  id: string;
  name_fr: string;
  name_ar: string;
  slug: string;
  image: string | null;
  departmentId?: string;
  department?: { id: string; name_fr: string } | null;
  _count?: { products: number };
}

interface Department {
  id: string;
  name_fr: string;
}

export default function AdminCategoriesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // États des filtres en cascade : Département -> Catégorie -> Nom
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedCatId, setSelectedCatId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // États du formulaire d'ajout
  const [nameFr, setNameFr] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      const [catRes, deptRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/departments")
      ]);

      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(Array.isArray(data) ? data : (data?.categories || []));
      }
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprime les diacritiques/accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFr.trim()) return toast.error("Le nom en français est requis");
    
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_fr: nameFr.trim(),
          name_ar: nameAr.trim(),
          slug: generateSlug(nameFr),
          departmentId: departmentId || null,
        }),
      });

      if (res.ok) {
        toast.success("Catégorie créée avec succès !");
        setNameFr("");
        setNameAr("");
        setDepartmentId("");
        setShowForm(false);
        fetchAllData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur de création");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Catégorie supprimée !");
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur de suppression");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  // Liste des catégories pour la dropdown filtrée par département sélectionné
  const categoriesListForDropdown = selectedDept === "all"
    ? categories
    : categories.filter((c) => c.departmentId === selectedDept);

  // Filtrage combiné des catégories
  const filteredCategories = (categories || []).filter((cat) => {
    const matchesDept = selectedDept === "all" || cat.departmentId === selectedDept;
    const matchesCatDropdown = selectedCatId === "all" || cat.id === selectedCatId;
    
    const term = searchTerm.toLowerCase();
    const nameFrMatch = cat.name_fr?.toLowerCase() || "";
    const nameArMatch = cat.name_ar || "";
    const matchesSearch = nameFrMatch.includes(term) || nameArMatch.includes(term);

    return matchesDept && matchesCatDropdown && matchesSearch;
  });

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 font-medium">
        Chargement des catégories...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Catégories</h1>
          <p className="text-xs text-gray-500 mt-1">
            Total : {filteredCategories.length} sur {categories.length} catégorie(s) affichée(s)
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
            <FiPlus size={18} /> {showForm ? "Fermer le formulaire" : "Ajouter une catégorie"}
          </button>
        </div>
      </div>

      {/* Barre de filtres en cascade */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Filtrer par Département</label>
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedCatId("all");
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Tous les départements</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name_fr}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Filtrer par Catégorie</label>
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Toutes les catégories</option>
            {categoriesListForDropdown.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name_fr}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Rechercher par Nom</label>
          <div className="relative flex items-center">
            <FiSearch className="absolute left-3 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom de la catégorie..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout rapide */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Nouvelle Catégorie</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Nom (FR) *</label>
              <input
                type="text"
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Nom (AR) *</label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                dir="rtl"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Département *</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              >
                <option value="">-- Choisir un département --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name_fr}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Création..." : "Enregistrer la catégorie"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau des catégories */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Image</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Nom (FR)</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase text-right">Nom (AR)</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Département</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Produits</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCategories.map((cat) => {
              const deptName = cat.department?.name_fr || departments.find(d => d.id === cat.departmentId)?.name_fr || "-";

              return (
                <tr key={cat.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name_fr} className="w-full h-full object-cover" />
                      ) : (
                        <FiFolder className="text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{cat.name_fr}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-800" dir="rtl">
                    {cat.name_ar}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-amber-700">
                    {deptName}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                    {cat._count?.products ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/categories/${cat.id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg transition"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name_fr)}
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

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Aucune catégorie ne correspond à vos critères de recherche.
          </div>
        )}
      </div>
    </div>
  );
}