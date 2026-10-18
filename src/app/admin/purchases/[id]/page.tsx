"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiTrash2 } from "react-icons/fi";

interface Supplier {
  id: string;
  name: string;
  city?: string;
}

interface PurchaseForm {
  supplierId: string;
  supplierName: string;
  productName: string;
  quantity: number | string;
  totalCost: number;
  status: string;
}

export default function EditPurchasePage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [formData, setFormData] = useState<PurchaseForm>({
    supplierId: "",
    supplierName: "",
    productName: "",
    quantity: 1,
    totalCost: 0,
    status: "Livré",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (id && status === "authenticated") {
      async function fetchData() {
        try {
          setLoading(true);
          const [purchaseRes, suppliersRes] = await Promise.all([
            fetch(`/api/admin/purchases/${id}`),
            fetch("/api/admin/suppliers"),
          ]);

          if (suppliersRes.ok) {
            const suppData = await suppliersRes.json();
            setSuppliers(Array.isArray(suppData) ? suppData : []);
          }

          if (purchaseRes.ok) {
            const data = await purchaseRes.json();
            setFormData({
              supplierId: data.supplierId || "",
              supplierName: data.supplierName || "",
              productName: data.productName || "",
              quantity: data.quantity ?? 1,
              totalCost: Number(data.totalCost) || 0,
              status: data.status || "Livré",
            });
          } else {
            toast.error("Achat introuvable");
            router.push("/admin/purchases");
          }
        } catch (err) {
          toast.error("Erreur de chargement des données");
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }
  }, [id, status, router]);

  const handleSupplierChange = (supId: string) => {
    const selected = suppliers.find((s) => s.id === supId);
    setFormData({
      ...formData,
      supplierId: supId,
      supplierName: selected ? selected.name : "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId || !formData.productName.trim()) {
      return toast.error("Le fournisseur et le produit sont obligatoires.");
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        productName: formData.productName.trim(),
        quantity: Number(formData.quantity) || 1,
        totalCost: Number(formData.totalCost) || 0,
      };

      const res = await fetch(`/api/admin/purchases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Achat mis à jour avec succès !");
        router.push("/admin/purchases");
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer cet enregistrement d'achat ?")) return;

    try {
      const res = await fetch(`/api/admin/purchases/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Achat supprimé !");
        router.push("/admin/purchases");
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur serveur");
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-12 text-center text-gray-400 font-medium">Chargement des données...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/purchases" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Modifier l'Achat</h1>
            <p className="text-xs text-gray-500">Mettez à jour les détails de la facture fournisseur</p>
          </div>
        </div>
        <button 
          type="button"
          onClick={handleDelete} 
          className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 cursor-pointer"
        >
          <FiTrash2 size={16} /> Supprimer
        </button>
      </div>

      <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Fournisseur *</label>
          <select 
            required 
            value={formData.supplierId} 
            onChange={(e) => handleSupplierChange(e.target.value)} 
            className="w-full border rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="">-- Choisir un fournisseur --</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name} {sup.city ? `(${sup.city})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Produit acheté *</label>
          <input 
            type="text" 
            required 
            value={formData.productName} 
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })} 
            className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Quantité *</label>
            <input 
              type="number" 
              min="1"
              required 
              value={formData.quantity} 
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} 
              className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Coût Total (MAD) *</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              required 
              value={formData.totalCost} 
              onChange={(e) => setFormData({ ...formData, totalCost: Number(e.target.value) })} 
              className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Statut</label>
            <select 
              value={formData.status} 
              onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
              className="w-full border rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="Livré">Livré</option>
              <option value="En attente de livraison">En attente de livraison</option>
              <option value="Commandé">Commandé</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
          <Link href="/admin/purchases" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-3 rounded-xl text-sm transition">
            Annuler
          </Link>
          <button 
            type="submit" 
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-sm transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <FiSave size={16} /> {submitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}