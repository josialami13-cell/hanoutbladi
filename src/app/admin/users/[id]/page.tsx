"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiTrash2 } from "react-icons/fi";

interface UserForm {
  name: string;
  email: string;
  password?: string;
  role: string;
}

export default function EditUserPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<UserForm>({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/users/${id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            email: data.email || "",
            password: "", // Laisser vide par défaut
            role: data.role || "ADMIN",
          });
        } else {
          toast.error("Utilisateur introuvable");
          router.push("/admin/users");
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
        toast.error("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    }
    if (id && status === "authenticated") {
      fetchUser();
    }
  }, [id, status, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      return toast.error("L'email est obligatoire.");
    }
    if (formData.password && formData.password.length < 6) {
      return toast.error("Le mot de passe doit contenir au moins 6 caractères.");
    }

    setSubmitting(true);

    try {
      const payload: Record<string, any> = {
        name: formData.name.trim() || null,
        email: formData.email.trim(),
        role: formData.role,
      };

      // N'inclure le mot de passe que s'il a été renseigné
      if (formData.password && formData.password.trim() !== "") {
        payload.password = formData.password.trim();
      }

      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Utilisateur mis à jour avec succès !");
        router.push("/admin/users");
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur soumission:", error);
      toast.error("Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer cet administrateur ?")) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Utilisateur supprimé avec succès !");
        router.push("/admin/users");
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-12 text-center text-gray-400 font-medium">Chargement des données...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Modifier l'Administrateur</h1>
            <p className="text-xs text-gray-500">Mise à jour des informations d'accès et des rôles</p>
          </div>
        </div>
        <button
          type="button"
          disabled={submitting}
          onClick={handleDelete}
          className="bg-red-50 hover:bg-red-600 hover:text-white text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
        >
          <FiTrash2 size={16} /> Supprimer
        </button>
      </div>

      <form onSubmit={handleUpdate} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        
        <div className="max-h-[65vh] overflow-y-auto pr-4 space-y-6 custom-scrollbar">
          
          <div>
            <h3 className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              Informations du Compte
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rôle *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer font-semibold"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Link
            href="/admin/users"
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