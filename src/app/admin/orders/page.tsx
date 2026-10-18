// =============================================================
// PAGE ADMIN : GESTION DES COMMANDES (Liste, Approbation & Bouton Admin New)
// =============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FiEdit2, FiTrash2, FiSlash, FiCheckCircle, FiEye, FiX, FiShoppingBag } from "react-icons/fi";
import TranslatedText from "@/components/TranslatedText";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    name_fr: string;
  };
}

interface Order {
  id: string;
  orderNumber?: string;
  customerName: string;
  customerPhone?: string;
  address?: string;
  paymentMethod: string;
  notes?: string;
  totalAmount: number;
  status: string;
  createdAt?: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
}

export default function OrdersAdminPage() {
  const { status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // État pour la modale de détail des articles d'une commande
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } else {
        toast.error("Erreur lors du chargement des commandes.");
      }
    } catch (err) {
      console.error("Erreur de chargement :", err);
      toast.error("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

  // Approuver la commande
  const handleApproveOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });

      if (res.ok) {
        toast.success("Commande approuvée avec succès !");
        fetchOrders();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Erreur lors de l'approbation.");
      }
    } catch (err) {
      toast.error("Erreur serveur.");
    }
  };

  const handleEditOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Voulez-vous vraiment annuler cette commande ?")) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        toast.success("Commande annulée avec succès.");
        fetchOrders();
      } else {
        toast.error("Erreur lors de l'annulation.");
      }
    } catch (err) {
      toast.error("Erreur serveur.");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer définitivement cette commande ?")) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Commande supprimée avec succès.");
        fetchOrders();
      } else {
        toast.error("Erreur lors de la suppression.");
      }
    } catch (err) {
      toast.error("Erreur serveur.");
    }
  };

  // Filtrer les commandes en attente (ou toutes selon votre préférence, ici les non-approuvées/non-annulées)
  const activeOrders = orders.filter((ord) => {
    const isApproved = ord.status === "APPROVED" || ord.status === "DELIVERED" || ord.status === "Livré" || ord.status === "ARCHIVED";
    const isCancelled = ord.status === "cancelled" || ord.status === "CANCELLED";
    return !isApproved && !isCancelled;
  });

  if (status === "loading" || loading) {
    return <div className="p-12 text-center text-stone-400 font-medium">Chargement des commandes...</div>;
  }

  const itemsList = selectedOrderDetails?.items || selectedOrderDetails?.orderItems || [];

  return (
    <div className="bg-[#FAF9F5] min-h-screen p-6 sm:p-8 space-y-6 selection:bg-[#2C3E2D] selection:text-white">
      
      {/* EN-TÊTE AVEC LE BOUTON COMMANDE ADMIN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            <TranslatedText text="Gestion des Commandes" arText="إدارة الطلبات" />
          </h1>
          <p className="text-xs text-stone-500 font-light">
            <TranslatedText text="Approuvez les commandes et cliquez sur un identifiant pour voir le détail des articles." arText="وافق على الطلبات وانقر على المعرف لعرض تفاصيل المنتجات." />
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/orders/new")}
          className="bg-[#2C3E2D] hover:bg-[#1a261c] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
        >
          + Passer une commande Admin
        </button>
      </div>

      {/* MODAL DE DÉTAIL DES ARTICLES */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#2C3E2D]/10 text-[#2C3E2D] rounded-xl">
                  <FiShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-sm">
                    Commande #{selectedOrderDetails.orderNumber || "N/A"}
                  </h3>
                  <p className="text-[11px] text-stone-500">Client : <span className="font-bold text-stone-800">{selectedOrderDetails.customerName}</span></p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* LISTE DES PRODUITS DE LA COMMANDE */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {itemsList.length === 0 ? (
                <p className="text-xs text-center text-stone-400 py-6">Aucun article trouvé pour cette commande.</p>
              ) : (
                itemsList.map((item, idx) => (
                  <div key={item.id || idx} className="flex justify-between items-center p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs">
                    <div>
                      <div className="font-bold text-stone-900">{item.product?.name_fr || "Article"}</div>
                      <div className="text-stone-500 mt-0.5">
                        Quantité : <span className="font-extrabold text-[#2C3E2D]">{item.quantity}</span> × {item.price} MAD
                      </div>
                    </div>
                    <div className="font-black text-stone-900 text-xs">
                      {(Number(item.quantity) * Number(item.price)).toFixed(2)} MAD
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* TOTAL GLOBAL */}
            <div className="p-3 bg-[#2C3E2D]/5 rounded-2xl border border-[#2C3E2D]/10 flex justify-between items-center text-xs">
              <span className="font-bold text-[#2C3E2D]">Montant Total :</span>
              <span className="font-black text-[#2C3E2D] text-sm">{Number(selectedOrderDetails.totalAmount).toFixed(2)} MAD</span>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 bg-[#2C3E2D] hover:bg-[#1a261c] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLEAU DES COMMANDES EN ATTENTE */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-stone-100">
          <h2 className="font-bold text-stone-900 text-sm">📋 Commandes en attente d'approbation</h2>
        </div>
        
        {activeOrders.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-xs">Aucune commande en attente pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-[10px] uppercase tracking-wider border-b border-stone-100">
                  <th className="py-3 px-5 font-bold">N° Commande (Cliquable)</th>
                  <th className="py-3 px-5 font-bold">Client</th>
                  <th className="py-3 px-5 font-bold">Téléphone</th>
                  <th className="py-3 px-5 font-bold">Adresse</th>
                  <th className="py-3 px-5 font-bold">Paiement</th>
                  <th className="py-3 px-5 font-bold">Montant</th>
                  <th className="py-3 px-5 font-bold text-center">Approbation Admin</th>
                  <th className="py-3 px-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs text-stone-800">
                {activeOrders.map((ord, index) => (
                  <tr key={ord.id} className="hover:bg-stone-50/50 transition">
                    
                    {/* ID CLIQUABLE POUR VOIR LES ARTICLES VIA MODALE */}
                    <td className="py-4 px-5">
                      <button
                        onClick={() => setSelectedOrderDetails(ord)}
                        className="font-black text-[#C5A059] hover:underline text-left cursor-pointer flex items-center gap-1.5 text-sm"
                        title="Cliquer pour voir le détail des articles"
                      >
                        <span>#{ord.orderNumber || String(index + 1).padStart(4, '0')}</span>
                        <FiEye size={13} className="opacity-70" />
                      </button>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : ""}
                      </span>
                    </td>

                    <td className="py-4 px-5 font-bold">{ord.customerName}</td>
                    <td className="py-4 px-5 text-stone-600">{ord.customerPhone || "-"}</td>
                    <td className="py-4 px-5 max-w-xs truncate text-stone-600" title={ord.address}>{ord.address || "-"}</td>
                    
                    <td className="py-4 px-5 font-medium text-stone-600">
                      <div>
                        {ord.paymentMethod === "cash_on_delivery" && "💵 À la livraison"}
                        {ord.paymentMethod === "bank_transfer" && "🏦 Virement"}
                        {ord.paymentMethod === "credit_card" && "💳 Carte"}
                      </div>
                      {ord.notes && <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">{ord.notes}</div>}
                    </td>

                    <td className="py-4 px-5 font-black text-[#2C3E2D]">{Number(ord.totalAmount).toFixed(2)} MAD</td>
                    
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => handleApproveOrder(ord.id)}
                        className="bg-[#2C3E2D] hover:bg-[#1a261c] text-white px-4 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs mx-auto"
                        title="Approuver la commande"
                      >
                        <FiCheckCircle size={14} /> Approuver
                      </button>
                    </td>

                    <td className="py-4 px-5 text-right space-x-1">
                      <button
                        onClick={() => handleEditOrder(ord.id)}
                        className="p-2 bg-stone-100 hover:bg-[#2C3E2D]/10 hover:text-[#2C3E2D] text-stone-700 rounded-xl transition cursor-pointer inline-flex items-center font-bold"
                        title="Modifier"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleCancelOrder(ord.id)}
                        className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition cursor-pointer inline-flex items-center font-bold"
                        title="Annuler"
                      >
                        <FiSlash size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(ord.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer inline-flex items-center font-bold"
                        title="Supprimer"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}