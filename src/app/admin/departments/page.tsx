// =============================================================
// PAGE ADMIN - Gestion des Départements (Modèle épuré : FR, AR & Upload PC)
// =============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiPlus, FiRefreshCw, FiTrash2, FiEdit2, FiUpload } from "react-icons/fi";

interface Department {
  id: string;
  name_fr: string;
  name_ar?: string;
  slug: string;
  description_fr?: string;
  image?: string;
  isActive: boolean;
  _count?: {
    categories: number;
  };
}

export default function AdminDepartmentsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name_fr: "",
    name_ar: "",
    slug: "",
    description_fr: "",
    image: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDepartments();
    }
  }, [status]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : []);
      } else {
        toast.error("Erreur de chargement");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  // Gestion de l'upload de l'image depuis le PC
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
        setFormData((prev) => ({ ...prev, image: result.url }));
        toast.success("Image du département téléchargée depuis le PC !");
      } else {
        toast.error("Erreur lors du téléchargement de l'image.");
      }
    } catch (err) {
      toast.error("Erreur serveur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_fr.trim()) {
      toast.error("Le nom en français est obligatoire.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || generateSlug(formData.name_fr),
        }),
      });

      if (res.ok) {
        toast.success("Département créé avec succès !");
        setFormData({
          name_fr: "",
          name_ar: "",
          slug: "",
          description_fr: "",
          image: "",
          isActive: true,
        });
        setShowForm(false);
        fetchDepartments();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur de création");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer le département "${name}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/departments/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Département supprimé !");
        setDepartments((prev) => prev.filter((d) => d.id !== id));
      } else {
        toast.error("Erreur de suppression");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 font-medium">
        Chargement des départements...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Départements</h1>
          <p className="text-xs text-gray-500 mt-1">Total : {departments.length} département(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDepartments}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <FiRefreshCw size={14} /> Actualiser
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <FiPlus size={18} /> {showForm ? "Fermer" : "Ajouter un département"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Nouveau Département</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-xs font-semibold mb-1">Nom (FR) *</label>
              <input
                type="text"
                required
                value={formData.name_fr}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name_fr: e.target.value,
                    slug: generateSlug(e.target.value),
                  })
                }
                className="w-full p-2.5 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Nom (AR)</label>
              <input
                type="text"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                className="w-full p-2.5 border rounded-xl text-sm text-right"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Slug URL</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full p-2.5 border rounded-xl text-sm"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold mb-1">Description (FR)</label>
              <textarea
                rows={2}
                value={formData.description_fr}
                onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                className="w-full p-2.5 border rounded-xl text-sm"
              />
            </div>

            {/* SECTION UPLOAD D'IMAGE DEPUIS LE PC */}
            <div className="md:col-span-3 space-y-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <label className="block text-xs font-bold text-emerald-900 mb-1 flex items-center gap-2">
                <FiUpload size={14} /> Image du département (Importer depuis le PC)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer border border-gray-200 rounded-xl p-1 bg-white"
              />
              {uploading && <p className="text-[10px] text-amber-600 font-medium">Téléchargement vers le serveur en cours...</p>}
              
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                placeholder="URL de l'image (remplie automatiquement ou saisie manuelle)"
              />
            </div>

            <div className="md:col-span-3 flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Actif (visible sur le site)</span>
            </div>

            <div className="md:col-span-3 pt-2">
              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Création..." : "Enregistrer le département"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Image</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Nom (FR / AR)</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Slug</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Statut</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {departments.map((dept) => (
              <tr key={dept.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    {dept.image && (
                      <img src={dept.image} alt={dept.name_fr} className="w-full h-full object-cover" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-bold text-gray-900">{dept.name_fr}</div>
                  {dept.name_ar && <div className="text-xs text-gray-400" dir="rtl">{dept.name_ar}</div>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">{dept.slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      dept.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {dept.isActive ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/departments/${dept.id}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
                    >
                      <FiEdit2 size={13} /> Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(dept.id, dept.name_fr)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <FiTrash2 size={13} /> Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {departments.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Aucun département trouvé.
          </div>
        )}
      </div>
    </div>
  );
}