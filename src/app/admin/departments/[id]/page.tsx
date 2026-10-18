// =============================================================
// PAGE ADMIN - Modifier un Département (Français, Arabe, Image PC & Slug)
// =============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiUpload } from "react-icons/fi";

export default function EditDepartmentPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name_fr: "",
    name_ar: "",
    slug: "",
    description_fr: "",
    image: "",
    isActive: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchDepartment() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/departments/${id}`);
        if (res.ok) {
          const dept = await res.json();
          setFormData({
            name_fr: dept.name_fr || "",
            name_ar: dept.name_ar || "",
            slug: dept.slug || "",
            description_fr: dept.description_fr || "",
            image: dept.image || "",
            isActive: dept.isActive ?? true,
          });
        } else {
          toast.error("Département introuvable");
          router.push("/admin/departments");
        }
      } catch (err) {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }

    if (id && status === "authenticated") {
      fetchDepartment();
    }
  }, [id, status, router]);

  // Gestion de l'upload d'image depuis le PC
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
        toast.success("Nouvelle image téléchargée depuis le PC !");
      } else {
        toast.error("Erreur lors du téléchargement de l'image.");
      }
    } catch (err) {
      toast.error("Erreur serveur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_fr.trim()) {
      toast.error("Le nom en français est obligatoire.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/departments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Département mis à jour avec succès !");
        router.push("/admin/departments");
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur de mise à jour");
      }
    } catch (error) {
      toast.error("Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="text-center py-20 text-gray-500 font-medium">Chargement du département...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 p-4">
      <div className="flex items-center justify-between">
        <Link href="/admin/departments" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
          <FiArrowLeft size={18} /> Retour
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Modifier le Département</h1>
      </div>

      <form onSubmit={handleUpdate} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Nom (FR) *</label>
            <input
              type="text"
              required
              value={formData.name_fr}
              onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
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
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Description (FR)</label>
          <textarea
            rows={2}
            value={formData.description_fr}
            onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
            className="w-full p-2.5 border rounded-xl text-sm"
          />
        </div>

        {/* SECTION UPLOAD D'IMAGE DEPUIS LE PC */}
        <div className="space-y-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
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
            placeholder="URL de l'image"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-emerald-600 rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Actif (visible sur le site)</span>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Link href="/admin/departments" className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition">
            Annuler
          </Link>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <FiSave size={16} /> {submitting ? "Mise à jour..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}