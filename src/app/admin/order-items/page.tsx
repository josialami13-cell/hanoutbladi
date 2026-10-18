// =============================================================
// PAGE ADMIN ORDER-ITEMS - Liste des commandes, Modale & Suppression
// =============================================================

"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import TranslatedText from "@/components/TranslatedText";
import { FiCalendar, FiPrinter, FiShoppingBag, FiEye, FiTrash2, FiX } from "react-icons/fi";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    name_fr: string;
  };
}

interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  itemsCount?: number;
}

export default function AdminOrderItemsPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  // État pour la modale de détail des articles de la commande cliquée
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderRow | null>(null);

  // Filtres temporels : "month" | "week" | "day"
  const [filterType, setFilterType] = useState<"month" | "week" | "day">("month");
  
  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const currentMonth = currentDate.slice(0, 7); // YYYY-MM
  
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedDate, setSelectedDate] = useState<string>(currentDate);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.map((order: any) => ({
            ...order,
            itemsCount: order.items?.length || order.orderItems?.length || 0,
          }));
          setOrders(formatted);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer n'importe quelle commande (même archivée)
  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer définitivement la commande #${orderNumber} ?`)) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Commande supprimée avec succès.");
        // Mise à jour locale de la liste pour l'effacer instantanément de l'écran
        setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
        if (selectedOrderDetails?.id === orderId) {
          setSelectedOrderDetails(null);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Erreur lors de la suppression.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur serveur.");
    }
  };

  // Filtrage temporel (Mois ou Jour)
  const filteredOrders = orders.filter((order) => {
    if (!order.createdAt) return false;
    const orderDateStr = order.createdAt.split("T")[0];

    if (filterType === "day") {
      return orderDateStr === selectedDate;
    } 
    if (filterType === "month") {
      return orderDateStr.startsWith(selectedMonth);
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const itemsList = selectedOrderDetails?.items || selectedOrderDetails?.orderItems || [];

  return (
    <div className="bg-[#FAF9F5] min-h-screen p-6 sm:p-8 space-y-6 selection:bg-[#2C3E2D] selection:text-white">
      
      {/* En-tête & Filtres temporels (Masqué à l'impression) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-stone-200 print:hidden">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            <TranslatedText text="Liste des Commandes & Ramassage" arText="قائمة الطلبات والاستلام" />
          </h1>
          <p className="text-xs text-stone-500 font-light">
            <TranslatedText text="Cliquez sur un numéro de commande pour voir les articles ou supprimez directement" arText="انقر على رقم الطلب لعرض المنتجات أو احذف مباشرة" />
          </p>
        </div>

        {/* Options de Filtres Temporels */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center bg-white p-1 rounded-xl border border-stone-200 shadow-2xs text-xs font-semibold">
            <button
              onClick={() => setFilterType("month")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filterType === "month" ? "bg-[#2C3E2D] text-white" : "text-stone-600 hover:text-stone-900"}`}
            >
              Mois
            </button>
            <button
              onClick={() => setFilterType("day")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filterType === "day" ? "bg-[#2C3E2D] text-white" : "text-stone-600 hover:text-stone-900"}`}
            >
              Jour
            </button>
          </div>

          {filterType === "month" && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-2xs">
              <FiCalendar className="text-[#C5A059]" size={15} />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs text-stone-800 bg-transparent focus:outline-none cursor-pointer font-semibold"
              />
            </div>
          )}

          {filterType === "day" && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-2xs">
              <FiCalendar className="text-[#C5A059]" size={15} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs text-stone-800 bg-transparent focus:outline-none cursor-pointer font-semibold"
              />
            </div>
          )}

          <button
            onClick={handlePrint}
            className="bg-[#2C3E2D] hover:bg-[#1a261c] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FiPrinter size={14} /> Imprimer la liste
          </button>
        </div>
      </div>

      {/* MODAL DE DÉTAIL DE LA LIGNE DE COMMANDE */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base">
                  Commande #{selectedOrderDetails.orderNumber}
                </h3>
                <p className="text-[11px] text-stone-500">Client : <span className="font-bold text-stone-800">{selectedOrderDetails.customerName}</span></p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* LIGNES DES ARTICLES COMMANDÉS */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {itemsList.length === 0 ? (
                <p className="text-xs text-center text-stone-400 py-6">Aucun article trouvé.</p>
              ) : (
                itemsList.map((item, idx) => (
                  <div key={item.id || idx} className="flex justify-between items-center p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-stone-900">{item.product?.name_fr || "Article"}</div>
                      <div className="text-stone-500">
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
              <span className="font-bold text-[#2C3E2D]">Total Global :</span>
              <span className="font-black text-[#2C3E2D] text-sm">{Number(selectedOrderDetails.totalAmount).toFixed(2)} MAD</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleDeleteOrder(selectedOrderDetails.id, selectedOrderDetails.orderNumber)}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <FiTrash2 size={13} /> Supprimer cette commande
              </button>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 bg-[#2C3E2D] hover:bg-[#1a261c] text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* En-tête visible uniquement sur le papier imprimé */}
      <div className="hidden print:block mb-4">
        <h1 className="text-lg font-bold text-black">Hanout Bladi - Liste des Commandes (Ramassage)</h1>
        <p className="text-xs text-gray-600">Période : {filterType === "day" ? selectedDate : selectedMonth} | Imprimé le {new Date().toLocaleDateString()}</p>
      </div>

      {/* Tableau des commandes */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden print:border-none print:shadow-none">
        {loading ? (
          <div className="text-center py-12 text-stone-400 text-xs">Chargement...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs">
            <TranslatedText text="Aucune commande trouvée pour cette période." arText="لم يتم العثور على طلبات لهذه الفترة." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 print:bg-gray-100 border-b border-stone-200 text-stone-600 uppercase tracking-wider text-[10px]">
                  <th className="p-4 font-bold print:border print:border-gray-300">N° Commande (Cliquable)</th>
                  <th className="p-4 font-bold print:border print:border-gray-300">Client</th>
                  <th className="p-4 font-bold print:border print:border-gray-300">Articles</th>
                  <th className="p-4 font-bold print:border print:border-gray-300">Montant Total</th>
                  <th className="p-4 font-bold print:border print:border-gray-300">Statut</th>
                  <th className="p-4 font-bold print:border print:border-gray-300">Date</th>
                  <th className="p-4 font-bold text-right print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition">
                    
                    {/* Numéro de commande cliquable ouvrant la modale */}
                    <td className="p-4 font-serif font-bold print:border print:border-gray-300">
                      <button
                        onClick={() => setSelectedOrderDetails(order)}
                        className="text-[#C5A059] print:text-black hover:underline cursor-pointer flex items-center gap-1.5 text-sm font-black text-left"
                      >
                        <span>#{order.orderNumber}</span>
                        <FiEye size={13} className="opacity-70 print:hidden" />
                      </button>
                    </td>

                    {/* Client */}
                    <td className="p-4 print:border print:border-gray-300">
                      <p className="font-bold text-stone-900">{order.customerName}</p>
                      <p className="text-[11px] text-stone-500">{order.customerPhone}</p>
                    </td>

                    {/* Nombre d'articles */}
                    <td className="p-4 font-semibold text-stone-700 print:border print:border-gray-300">
                      {order.itemsCount} article(s)
                    </td>

                    {/* Montant */}
                    <td className="p-4 font-black text-[#2C3E2D] print:border print:border-gray-300">
                      {Number(order.totalAmount || 0).toFixed(2)} MAD
                    </td>

                    {/* Statut */}
                    <td className="p-4 print:border print:border-gray-300">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        order.status === "ARCHIVED" ? "bg-stone-200 text-stone-800" :
                        order.status === "PAID" ? "bg-emerald-100 text-emerald-800" :
                        order.status === "DELIVERING" ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-stone-500 print:border print:border-gray-300">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR") : "-"}
                    </td>

                    {/* Action de suppression directe */}
                    <td className="p-4 text-right print:hidden">
                      <button
                        onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer inline-flex items-center"
                        title="Supprimer la commande"
                      >
                        <FiTrash2 size={14} />
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