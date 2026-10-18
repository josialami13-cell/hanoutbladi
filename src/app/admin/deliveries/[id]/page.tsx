"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiTrash2, FiMapPin } from "react-icons/fi";

interface DeliveryMan {
  id: string;
  fullName: string;
  zone: string;
  phone?: string;
}

interface DeliveryData {
  id: string;
  trackingNumber: string;
  status: string;
  shippingFee: number;
  deliveryManId?: string | null;
  notes?: string | null;
  order?: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    address: string;
    city: string;
  };
}

export default function EditDeliveryPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryData | null>(null);
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);

  const [formData, setFormData] = useState({
    deliveryManId: "",
    status: "En attente",
    shippingFee: "0",
    notes: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [delivRes, menRes] = await Promise.all([
          fetch(`/api/admin/deliveries/${id}`),
          fetch(`/api/admin/delivery-men`),
        ]);

        if (delivRes.ok) {
          const data: DeliveryData = await delivRes.json();
          setDelivery(data);
          setFormData({
            deliveryManId: data.deliveryManId || "",
            status: data.status || "En attente",
            shippingFee: String(data.shippingFee || 0),
            notes: data.notes || "",
          });
        } else {
          toast.error("Livraison introuvable");
          router.push("/admin/deliveries");
        }

        if (menRes.ok) {
          const menData = await menRes.json();
          setDeliveryMen(Array.isArray(menData) ? menData : []);
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
        toast.error("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    }

    if (id && status === "authenticated") {
      fetchData();
    }
  }, [id, status, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        status: formData.status,
        deliveryManId: formData.deliveryManId || null,
        shippingFee: Number(formData.shippingFee),
        notes: formData.notes.trim() || null,
      };

      const res = await fetch(`/api/admin/deliveries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Livraison mise à jour avec succès !");
        router.push("/admin/deliveries");
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
    if (!confirm("Voulez-vous vraiment supprimer cette livraison ?")) return;

    try {
      const res = await fetch(`/api/admin/deliveries/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Livraison supprimée avec succès !");
        router.push("/admin/deliveries");
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
    return <div className="p-12 text-center text-gray-400 font-medium">Chargement des détails...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/deliveries" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Détails & Modification de la Livraison</h1>
            <p className="text-xs text-gray-500">N° de suivi : {delivery?.trackingNumber}</p>
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
          
          {/* SECTION 1 : Infos de la Commande liée */}
          <div>
            <h3 className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              1. Informations de la Commande ({delivery?.order?.orderNumber})
            </h3>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 text-xs block">Client :</span>
                <span className="font-bold text-gray-900">{delivery?.order?.customerName}</span> ({delivery?.order?.customerPhone})
              </div>
              <div>
                <span className="text-gray-500 text-xs block">Montant de la commande :</span>
                <span className="font-bold text-emerald-600">{delivery?.order?.totalAmount} MAD</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-500 text-xs block">Adresse de destination :</span>
                <span className="font-medium text-gray-800 flex items-center gap-1 mt-0.5">
                  <FiMapPin size={14} className="text-gray-400" /> {delivery?.order?.address}, {delivery?.order?.city}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2 : Paramètres de Livraison */}
          <div>
            <h3 className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              2. Paramètres & Affectation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Statut de la livraison</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="En attente">En attente</option>
                  <option value="En cours">En cours</option>
                  <option value="Livré">Livré</option>
                  <option value="Échoué">Échoué</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Livreur assigné</label>
                <select
                  value={formData.deliveryManId}
                  onChange={(e) => setFormData({ ...formData, deliveryManId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Aucun livreur --</option>
                  {deliveryMen.map((man) => (
                    <option key={man.id} value={man.id}>
                      {man.fullName} ({man.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Frais de port (MAD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.shippingFee}
                  onChange={(e) => setFormData({ ...formData, shippingFee: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-700 mb-1">Notes logistiques</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Instructions particulières..."
                />
              </div>
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Link
            href="/admin/deliveries"
            className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition"
          >
            Retour
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