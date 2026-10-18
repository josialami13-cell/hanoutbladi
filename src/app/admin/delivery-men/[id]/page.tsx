"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiTrash2 } from "react-icons/fi";

export default function EditDeliveryManPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    zone: "",
    vehicle: "",
    status: "Disponible",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchDeliveryMan() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/delivery-men/${id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            fullName: data.fullName || "",
            phone: data.phone || "",
            zone: data.zone || "",
            vehicle: data.vehicle || "",
            status: data.status || "Disponible",
          });
        } else {
          toast.error("Livreur introuvable");
          router.push("/admin/delivery-men");
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
        toast.error("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    }

    if (id && status === "authenticated") {
      fetchDeliveryMan();
    }
  }, [id, status, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      return toast.error("Le nom et le téléphone sont obligatoires.");
    }

    setSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        zone: formData.zone.trim() || null,
        vehicle: formData.vehicle.trim() || null,
        status: formData.status || "Disponible",
      };

      const res = await fetch(`/api/admin/delivery-men/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Livreur mis à jour avec succès !");
        router.push("/admin/delivery-men");
      } else {
        const errorData = await res.json();
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
    if (!confirm("Voulez-vous vraiment supprimer ce livreur ?")) return;

    try {
      const res = await fetch(`/api/admin/delivery-men/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Livreur supprimé avec succès !");
        router.push("/admin/delivery-men");
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
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/delivery-men" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Modifier le Livreur</h1>
            <p className="text-xs text-gray-500">Mise à jour complète des informations du livreur</p>
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
        
        {/* Conteneur à défilement fluide */}
        <div className="max-h-[65vh] overflow-y-auto pr-4 space-y-6 custom-scrollbar">
          
          <div>
            <h3 className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              Informations du Livreur
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Téléphone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Zone de livraison</label>
                <input
                  type="text"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Véhicule</label>
                <input
                  type="text"
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Statut *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer font-semibold"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="En tournée">En tournée</option>
                  <option value="En livraison">En livraison</option>
                  <option value="Occupé">Occupé</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Boutons d'action en bas */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Link
            href="/admin/delivery-men"
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