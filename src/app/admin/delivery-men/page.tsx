"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiPlus, FiPhone, FiTruck, FiEdit3 } from "react-icons/fi";

interface DeliveryMan {
  id: string;
  fullName: string;
  phone: string;
  zone: string;
  vehicle: string;
  status: string;
}

export default function AdminDeliveryMenPage() {
  const { status } = useSession();
  const router = useRouter();
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    zone: "Settat et environs",
    vehicle: "Scooter",
    status: "Disponible",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchDeliveryMen() {
      try {
        const res = await fetch("/api/admin/delivery-men");
        if (res.ok) {
          const data = await res.json();
          setDeliveryMen(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated") {
      fetchDeliveryMen();
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      return toast.error("Le nom et le téléphone sont obligatoires");
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/delivery-men", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          zone: formData.zone.trim(),
          vehicle: formData.vehicle.trim(),
          status: formData.status,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setDeliveryMen([created, ...deliveryMen]);
        setShowModal(false);
        setFormData({ fullName: "", phone: "", zone: "Settat et environs", vehicle: "Scooter", status: "Disponible" });
        toast.success("Livreur ajouté avec succès !");
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      toast.error("Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-12 text-center text-gray-400 font-medium">Chargement de l'équipe de livraison...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Équipe de Livraison</h1>
            <p className="text-xs text-gray-500">Gestion des livreurs et suivi des zones locales</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <FiPlus size={16} /> Ajouter un livreur
        </button>
      </div>

      {deliveryMen.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <p className="text-gray-500 text-sm mb-4">Aucun livreur enregistré pour le moment.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-emerald-700 font-bold text-xs bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition cursor-pointer"
          >
            Créer le premier livreur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveryMen.map((man) => (
            <Link 
              key={man.id} 
              href={`/admin/delivery-men/${man.id}`}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition group"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    man.status === "Disponible" 
                      ? "bg-emerald-50 text-emerald-700"
                      : man.status === "En tournée"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {man.status}
                  </span>
                  <span className="text-gray-400 group-hover:text-emerald-600 transition flex items-center gap-1 text-xs font-semibold">
                    <FiEdit3 size={14} /> Modifier
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-emerald-700 transition">{man.fullName}</h3>
                <div className="space-y-1.5 mt-3 text-xs text-gray-600 border-t border-gray-100 pt-3">
                  <p className="flex items-center gap-2"><FiPhone className="text-gray-400" /> {man.phone}</p>
                  <p className="flex items-center gap-2"><FiTruck className="text-gray-400" /> Zone : {man.zone}</p>
                  <p className="text-gray-400 text-[11px] pt-1">Véhicule : {man.vehicle}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal d'ajout */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Nouveau Livreur</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom complet *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.fullName} 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  placeholder="Ex: Youssef Benani" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone *</label>
                <input 
                  type="tel" 
                  required 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  placeholder="06..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Zone</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.zone} 
                    onChange={(e) => setFormData({...formData, zone: e.target.value})} 
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Véhicule</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.vehicle} 
                    onChange={(e) => setFormData({...formData, vehicle: e.target.value})} 
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Statut initial</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})} 
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="En tournée">En tournée</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
              <div className="flex gap-2 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}