"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiPlus, FiPhone, FiMapPin, FiUser, FiEdit3 } from "react-icons/fi";

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  city: string;
  speciality: string;
}

export default function AdminSuppliersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    city: "Settat",
    speciality: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchSuppliers() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/suppliers");
        if (res.ok) {
          const data = await res.json();
          setSuppliers(Array.isArray(data) ? data : data.suppliers || []);
        } else {
          toast.error("Erreur de chargement des fournisseurs");
        }
      } catch (err) {
        console.error(err);
        toast.error("Erreur de connexion");
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated") {
      fetchSuppliers();
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contactPerson.trim() || !formData.phone.trim()) {
      return toast.error("Veuillez remplir tous les champs obligatoires.");
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim() || "Settat",
        speciality: formData.speciality.trim(),
      };

      const res = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        setSuppliers([created, ...suppliers]);
        setShowModal(false);
        setFormData({ name: "", contactPerson: "", phone: "", city: "Settat", speciality: "" });
        toast.success("Fournisseur ajouté avec succès !");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      toast.error("Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return <div className="p-12 text-center text-gray-400 font-medium">Chargement de la session...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Gestion des Fournisseurs</h1>
            <p className="text-xs text-gray-500">Producteurs et coopératives partenaires du terroir</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <FiPlus size={16} /> Ajouter un fournisseur
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 font-medium">Chargement des données...</div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <p className="text-gray-500 text-sm mb-4">Aucun fournisseur enregistré pour le moment.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-emerald-600 font-bold text-xs bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition cursor-pointer"
          >
            Créer le premier fournisseur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((sup) => (
            <Link 
              key={sup.id} 
              href={`/admin/suppliers/${sup.id}`}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition group"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {sup.speciality || "Partenaire"}
                  </span>
                  <span className="text-gray-300 group-hover:text-emerald-600 transition flex items-center gap-1 text-xs font-semibold">
                    <FiEdit3 size={14} /> Modifier
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-emerald-700 transition">{sup.name}</h3>
                <div className="space-y-1.5 mt-3 text-xs text-gray-600 border-t border-gray-100 pt-3">
                  <p className="flex items-center gap-2"><FiUser className="text-gray-400" /> {sup.contactPerson || "Non renseigné"}</p>
                  <p className="flex items-center gap-2"><FiPhone className="text-gray-400" /> {sup.phone || "Non renseigné"}</p>
                  <p className="flex items-center gap-2"><FiMapPin className="text-gray-400" /> {sup.city || "Maroc"}</p>
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
            <h2 className="text-xl font-bold text-gray-900">Nouveau Fournisseur</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom de la ferme / coopérative *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  placeholder="Ex: Ferme Bio Atlas" 
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
                  placeholder="Ex: Mohammed Alami" 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone *</label>
                  <input 
                    type="tel" 
                    required 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                    placeholder="06..." 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Ville / Région</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Spécialité / Produits fournis</label>
                <input 
                  type="text" 
                  value={formData.speciality} 
                  onChange={(e) => setFormData({ ...formData, speciality: e.target.value })} 
                  className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  placeholder="Ex: Miel et Huiles d'olive" 
                />
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