"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiTrash2, FiMapPin, FiPhone, FiUser, FiTruck } from "react-icons/fi";

interface DeliveryMan {
  id: string;
  fullName: string;
  zone: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    name_fr: string;
  };
}

interface OrderData {
  id: string;
  orderNumber?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  shippingMode?: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  notes?: string;
  items?: OrderItem[];
  delivery?: {
    deliveryManId?: string | null;
  };
}

export default function EditOrderPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);

  const [formData, setFormData] = useState({
    status: "pending",
    paymentMethod: "cash_on_delivery",
    deliveryManId: "",
    shippingAddress: "",
    notes: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        setLoading(true);
        const [orderRes, deliveryMenRes] = await Promise.all([
          fetch(`/api/admin/orders/${id}`),
          fetch(`/api/admin/delivery-men`),
        ]);

        if (orderRes.ok) {
          const data: OrderData = await orderRes.json();
          setOrder(data);
          setFormData({
            status: data.status || "pending",
            paymentMethod: data.paymentMethod || "cash_on_delivery",
            deliveryManId: data.delivery?.deliveryManId || "",
            shippingAddress: data.address || "",
            notes: data.notes || "",
          });
        } else {
          toast.error("Commande introuvable ou erreur serveur");
          router.push("/admin/orders");
        }

        if (deliveryMenRes.ok) {
          const men = await deliveryMenRes.json();
          setDeliveryMen(Array.isArray(men) ? men : []);
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
        toast.error("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated" && id) {
      fetchData();
    }
  }, [id, status, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const isStandard = order?.shippingMode === "standard";
    const isTryingToApprove = formData.status === "processing" || formData.status === "delivered";

    if (isStandard && isTryingToApprove && !formData.deliveryManId) {
      toast.error("⚠️ Cette commande est en mode Standard. Vous devez obligatoirement assigner un livreur avant de l'approuver !");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        deliveryManId: formData.deliveryManId || null,
        address: formData.shippingAddress.trim() || null,
        notes: formData.notes.trim() || null,
      };

      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Commande mise à jour avec succès !");
        router.push("/admin/orders");
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
    if (!confirm("Voulez-vous vraiment supprimer cette commande ?")) return;

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Commande supprimée !");
        router.push("/admin/orders");
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
    return <div className="p-12 text-center text-gray-400 font-medium">Chargement de la commande...</div>;
  }

  const isApproved = formData.status === "processing" || formData.status === "delivered";
  const isStandardMode = order?.shippingMode === "standard";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Détails & Modification de la Commande</h1>
            <p className="text-xs text-gray-500">Réf / N° : {order?.orderNumber || order?.id}</p>
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

          {/* RAPPEL DU MODE DE LIVRAISON CHOISI */}
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <FiTruck size={16} /> Mode de livraison choisi par le client :
              <span className="uppercase bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[11px] tracking-wide">
                {order?.shippingMode || "standard"}
              </span>
            </div>
            {isStandardMode && (
              <span className="text-blue-700 italic">
                * Mode Standard : Assignation d'un livreur obligatoire avant approbation.
              </span>
            )}
          </div>

          {/* SECTION 0 : Coordonnées & Adresse du Client */}
          <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 space-y-3">
            <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
              <FiMapPin size={15} /> Coordonnées & Adresse de Livraison du Client
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-700">
              <div>
                <span className="font-bold text-gray-400 block mb-0.5">Client :</span>
                <p className="font-extrabold text-gray-900 text-sm flex items-center gap-1">
                  <FiUser size={13} className="text-emerald-600" /> {order?.customerName || "Non renseigné"}
                </p>
                <p className="text-gray-500">{order?.customerEmail || "Aucun email"}</p>
              </div>
              <div>
                <span className="font-bold text-gray-400 block mb-0.5">Téléphone :</span>
                <p className="font-extrabold text-gray-900 text-sm flex items-center gap-1">
                  <FiPhone size={13} className="text-emerald-600" /> {order?.customerPhone || "Non renseigné"}
                </p>
              </div>
              <div>
                <span className="font-bold text-emerald-800 block mb-0.5">Adresse de livraison :</span>
                <p className="font-bold text-emerald-950 bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                  {order?.address || formData.shippingAddress || "Aucune adresse renseignée"}
                  {order?.city ? `, ${order.city}` : ""} ({order?.country || "Maroc"})
                </p>
              </div>
            </div>
          </div>
          
          {/* SECTION 1 : Statuts, Approbation & Affectation */}
          <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider">
                1. Statuts & Approbation
              </h3>
              
              <button
                type="button"
                onClick={() => {
                  if (isStandardMode && !isApproved && !formData.deliveryManId) {
                    toast.error("Veuillez d'abord assigner un livreur (Mode Standard requis).");
                    return;
                  }
                  const nextStatus = isApproved ? "pending" : "processing";
                  setFormData({ ...formData, status: nextStatus });
                  toast.success(nextStatus === "processing" ? "Commande approuvée avec succès !" : "Commande désapprouvée (remise en attente)");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                  isApproved
                    ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {isApproved ? "✓ Commande Approuvée (Cliquer pour désapprouver)" : "Approuver la commande"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Statut global de la commande</label>
                <select
                  value={formData.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    if (isStandardMode && (newStatus === "processing" || newStatus === "delivered") && !formData.deliveryManId) {
                      toast.error("Attention : Un livreur est requis pour le mode standard.");
                    }
                    setFormData({ ...formData, status: newStatus });
                  }}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer font-semibold"
                >
                  <option value="pending">En attente (Pending)</option>
                  <option value="processing">En cours de traitement (Approuvée)</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Méthode de paiement</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="cash_on_delivery">Paiement à la livraison</option>
                  <option value="paid">Payé en ligne / Carte</option>
                  <option value="bank_transfer">Virement bancaire</option>
                  <option value="cash_plus">Wafacash / CashPlus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Livreur assigné {isStandardMode && <span className="text-red-500">* (Requis)</span>}
                </label>
                <select
                  value={formData.deliveryManId}
                  onChange={(e) => setFormData({ ...formData, deliveryManId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choisir un livreur --</option>
                  {deliveryMen.map((man) => (
                    <option key={man.id} value={man.id}>
                      {man.fullName} ({man.zone})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2 : Adresse & Notes modifiables */}
          <div>
            <h3 className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              2. Adresse & Notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Modifier l'adresse de livraison</label>
                <textarea
                  rows={2}
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notes internes / client</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3 : Articles commandés (Lecture seule) */}
          <div>
            <h3 className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              3. Articles commandés ({order?.items?.length || 0})
            </h3>
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
                  <tr>
                    <th className="p-3">Produit</th>
                    <th className="p-3">Quantité</th>
                    <th className="p-3">Prix unitaire</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order?.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{item.product?.name_fr || "Produit"}</td>
                      <td className="p-3 text-gray-600">{item.quantity}</td>
                      <td className="p-3 text-gray-600">{item.price} MAD</td>
                      <td className="p-3 text-right font-bold text-emerald-600">{item.quantity * item.price} MAD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4 text-base font-extrabold text-gray-900">
              Montant Total : <span className="text-emerald-600 ml-2">{order?.totalAmount || 0} MAD</span>
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Link
            href="/admin/orders"
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