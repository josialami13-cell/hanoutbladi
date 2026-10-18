"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiTrash2 } from "react-icons/fi";

interface Department {
  id: string;
  name_fr: string;
}

export default function EditCategoryPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [formData, setFormData] = useState({
    name_fr: "",
    name_ar: "",
    slug: "",
    description_fr: "",
    description_ar: "",
    departmentId: "",
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, deptRes] = await Promise.all([
          fetch(`/api/admin/categories/${id}`),
          fetch(`/api/admin/departments`),
        ]);

        if (catRes.ok) {
          const category = await catRes.json();
          setFormData({
            name_fr: category.name_fr || "",
            name_ar: category.name_ar || "",
            slug: category.slug || "",
            description_fr: category.description_fr || "",
            description_ar: category.description_ar || "",
            departmentId: category.departmentId || "",
            isActive: category.isActive ?? true,
            isFeatured: category.isFeatured ?? false,
          });
        } else {
          toast.error("Catégorie introuvable");
          router.push("/admin/categories");
        }

        if (deptRes.ok) {
          const depts = await deptRes.json();
          setDepartments(Array.isArray(depts) ? depts : []);
        }
      } catch (err) {
        console.error("Erreur de chargement:", err);
        toast.error("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    }
    if (id && status === "authenticated") {
      fetchData();
    }
  }, [id, status, router]);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_fr.trim()) return toast.error("Le nom (FR) est obligatoire");

    setSubmitting(true);

    try {
      const finalSlug = formData.slug.trim() ? slugify(formData.slug) : slugify(formData.name_fr);

      const payload = {
        name_fr: formData.name_fr.trim(),
        name_ar: formData.name_ar.trim() || null,
        slug: finalSlug,
        description_fr: formData.description_fr.trim() || null,
        description_ar: formData.description_ar.trim() || null,
        departmentId: formData.departmentId || null,
        isActive: Boolean(formData.isActive),
        isFeatured: Boolean(formData.isFeatured),
      };

      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Catégorie modifiée avec succès !");
        router.push("/admin/categories");
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Erreur soumission:", error);
      toast.error("Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Catégorie supprimée avec succès !");
        router.push("/admin/categories");
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur serveur");
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-12 text-center text-gray-400 font-medium">Chargement des données...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Modifier la Catégorie</h1>
            <p className="text-xs text-gray-500">Mise à jour complète de l'ensemble des attributs de la catégorie</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="bg-red-50 hover:bg-red-600 hover:text-white text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <FiTrash2 size={16} /> Supprimer
        </button>
      </div>

      <form onSubmit={handleUpdate} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        
        <div className="max-h-[65vh] overflow-y-auto pr-4 space-y-6 custom-scrollbar">
          
          <div>
            <h3 className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              1. Informations Générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nom (Français) *</label>
                <input
                  type="text"
                  required
                  value={formData.name_fr}
                  onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nom (Arabe)</label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Slug URL *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Département *</label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Sélectionner un département</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name_fr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              2. Descriptions
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description (Français)</label>
                <textarea
                  rows={3}
                  value={formData.description_fr}
                  onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description (Arabe)</label>
                <textarea
                  rows={3}
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-right"
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              3. Paramètres & Statut
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                />
                Actif
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                />
                En vedette
              </label>
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Link
            href="/admin/categories"
            className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <FiSave size={16} /> {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}