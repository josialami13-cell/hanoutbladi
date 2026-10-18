"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiTrash2 } from "react-icons/fi";

interface SupplierForm {
  name: string;
  contactPerson: string;
  phone: string;
  city: string;
  speciality: string;
}

export default function EditSupplierPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<SupplierForm>({
    name: "",
    contactPerson: "",
    phone: "",
    city: "",
    speciality: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (id && status === "authenticated") {
      async function fetchSupplier() {
        try {
          setLoading(true);
          const res = await fetch(`/api/admin/suppliers/${id}`);
          if (res.ok) {
            const data = await res.json();
            setFormData({
              name: data.name || "",
              contactPerson: data.contactPerson || "",
              phone: data.phone || "",
              city: data.city || "",
              speciality: data.speciality || "",
            });
          } else {
            toast.error("Fournisseur introuvable");
            router.push("/admin/suppliers");
          }
        } catch (err) {
          toast.error("Erreur de chargement des données");
        } finally {
          setLoading(false);
        }
      }
      fetchSupplier();
    }
  }, [id, status, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contactPerson.trim() || !formData.phone.trim()) {
      return toast.error("Veuillez remplir les champs obligatoires.");
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        speciality: formData.speciality.trim(),
      };

      const res = await fetch(`/api/admin/suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Fournisseur mis à jour avec succès !");
        router.push("/admin/suppliers");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer ce fournisseur ?")) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Fournisseur supprimé !");
        router.push("/admin/suppliers");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-12 text-center text-gray-400 font-medium">Chargement des données...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/suppliers" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Modifier le Fournisseur</h1>
            <p className="text-xs text-gray-500">Mettez à jour les coordonnées et informations</p>
          </div>
        </div>
        <button 
          type="button"
          disabled={submitting}
          onClick={handleDelete} 
          className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <FiTrash2 size={16} /> Supprimer
        </button>
      </div>

      <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Nom de la ferme / coopérative *</label>
          <input 
            type="text" 
            required 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Personne de contact *</label>
          <input 
            type="text" 
            required 
            value={formData.contactPerson} 
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} 
            className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone *</label>
            <input 
              type="tel" 
              required 
              value={formData.phone} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
              className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Ville / Région *</label>
            <input 
              type="text" 
              required 
              value={formData.city} 
              onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
              className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Spécialité</label>
          <input 
            type="text" 
            value={formData.speciality} 
            onChange={(e) => setFormData({ ...formData, speciality: e.target.value })} 
            className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
          />
        </div>
        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
          <Link href="/admin/suppliers" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-3 rounded-xl text-sm transition">
            Annuler
          </Link>
          <button 
            type="submit" 
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-sm transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <FiSave size={16} /> {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}