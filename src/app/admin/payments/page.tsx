// =============================================================
// PAGE ADMIN PAIEMENTS - Suivi des encaissements & Livreurs
// =============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { 
  FiDollarSign, 
  FiSearch, 
  FiCheckCircle, 
  FiClock, 
  FiRefreshCw, 
  FiCheck,
  FiTruck,
  FiCalendar
} from "react-icons/fi";

interface DeliveryManInfo {
  id: string;
  fullName: string;
}

interface DeliveryInfo {
  id: string;
  shippingFee?: number;
  status?: string;
  deliveryMan?: DeliveryManInfo | null;
}

interface OrderPayment {
  id: string;
  orderNumber?: string;
  customerName?: string;
  customerPhone?: string;
  totalAmount?: number;
  paymentMethod?: string;
  status?: string;
  paymentStatus?: string; 
  createdAt?: string;
  delivery?: DeliveryInfo | null;
}

export default function AdminPaymentsPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [payments, setPayments] = useState<OrderPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING">("PENDING");
  
  const [timeFilter, setTimeFilter] = useState<"ALL" | "YEAR" | "MONTH" | "WEEK">("ALL");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, "0"));

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payments");
      if (res.ok) {
        const data = await res.json();
        setPayments(Array.isArray(data) ? data : []);
      } else {
        toast.error("Erreur lors du chargement des paiements");
      }
    } catch (error) {
      toast.error("Erreur réseau lors du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPayments();
    }
  }, [status, fetchPayments]);

  const handleMarkAsPaid = async (orderId: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId, 
          status: "PAID", 
          paymentStatus: "PAID" 
        }),
      });

      if (res.ok) {
        toast.success("Règlement validé et encaissé avec succès !");
        fetchPayments();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de la validation");
      }
    } catch (error) {
      toast.error("Erreur serveur lors de la mise à jour");
    } finally {
      setUpdatingId(null);
    }
  };

  const getPaymentLabel = (method?: string) => {
    if (!method) return "Non spécifié";
    const labels: Record<string, string> = {
      cash_on_delivery: "💵 Paiement à la livraison",
      bank_transfer: "🏦 Virement bancaire",
      credit_card: "💳 Carte bancaire",
      cash_plus: "⚡ Wafacash / CashPlus",
    };
    return labels[method] || method;
  };

  const isPaymentPaid = (p: OrderPayment) => {
    const payStatus = (p.paymentStatus || "").toUpperCase();
    const orderStatus = (p.status || "").toUpperCase();
    return payStatus === "PAID" || orderStatus === "PAID" || orderStatus === "DELIVERED";
  };

  const matchesTimeFilter = (dateString?: string) => {
    if (timeFilter === "ALL") return true;
    if (!dateString) return false;

    const itemDate = new Date(dateString);
    const now = new Date();

    if (timeFilter === "YEAR") {
      return itemDate.getFullYear().toString() === selectedYear;
    }

    if (timeFilter === "MONTH") {
      const matchesY = itemDate.getFullYear().toString() === selectedYear;
      const matchesM = (itemDate.getMonth() + 1).toString().padStart(2, "0") === selectedMonth;
      return matchesY && matchesM;
    }

    if (timeFilter === "WEEK") {
      const onejan = new Date(now.getFullYear(), 0, 1);
      const weekNow = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
      const weekItem = Math.ceil((((itemDate.getTime() - onejan.getTime()) / 86400000) + itemDate.getDay() + 1) / 7);
      return itemDate.getFullYear() === now.getFullYear() && weekItem === weekNow;
    }

    return true;
  };

  const filteredPayments = payments.filter((p) => {
    const paid = isPaymentPaid(p);

    if (statusFilter === "PENDING" && paid) return false;
    if (statusFilter === "PAID" && !paid) return false;

    if (!matchesTimeFilter(p.createdAt)) return false;

    const term = searchTerm.toLowerCase();
    const idMatch = (p.orderNumber || p.id || "").toLowerCase().includes(term);
    const methodMatch = (p.paymentMethod || "").toLowerCase().includes(term);
    const nameMatch = (p.customerName || "").toLowerCase().includes(term);
    const deliveryManMatch = (p.delivery?.deliveryMan?.fullName || "").toLowerCase().includes(term);
    
    return idMatch || methodMatch || nameMatch || deliveryManMatch;
  });

  const totalCollected = payments
    .filter((p) => isPaymentPaid(p) && matchesTimeFilter(p.createdAt))
    .reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);

  const pendingCount = payments.filter((p) => !isPaymentPaid(p) && matchesTimeFilter(p.createdAt)).length;
  const paidCount = payments.filter((p) => isPaymentPaid(p) && matchesTimeFilter(p.createdAt)).length;

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm font-medium">
        <FiRefreshCw className="animate-spin mr-2 text-emerald-600" size={18} /> Chargement des paiements...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* En-tête & Résumé Financier */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gestion des Paiements & Encaissements</h1>
          <p className="text-xs text-gray-500 mt-1">
            Suivi des règlements et filtres temporels de comptabilité
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-2xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Transactions (Période)</p>
            <p className="text-base font-extrabold text-gray-800">
              <span className="text-emerald-600">{paidCount} Payés</span> / <span className="text-amber-600">{pendingCount} En attente</span>
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 px-5 py-3 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
              <FiDollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Total Encaissé (Période)</p>
              <p className="text-xl font-black text-emerald-900">{totalCollected.toFixed(2)} MAD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barres de Filtres */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <FiSearch className="text-gray-400 text-lg ml-2 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par client, mode, référence ou nom du livreur..."
              className="w-full bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 bg-gray-100 rounded-lg cursor-pointer shrink-0"
              >
                Effacer
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex-1 sm:flex-none ${
                statusFilter === "PENDING" ? "bg-white text-amber-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              En attente
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PAID")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex-1 sm:flex-none ${
                statusFilter === "PAID" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Payés
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex-1 sm:flex-none ${
                statusFilter === "ALL" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Tous
            </button>
          </div>
        </div>

        {/* Ligne de Filtres Temporels */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
            <FiCalendar className="text-emerald-600" size={16} />
            <span>Période :</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTimeFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                timeFilter === "ALL" ? "bg-emerald-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Toutes les périodes
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("WEEK")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                timeFilter === "WEEK" ? "bg-emerald-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Cette semaine
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("MONTH")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                timeFilter === "MONTH" ? "bg-emerald-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Ce mois
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("YEAR")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                timeFilter === "YEAR" ? "bg-emerald-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Cette année
            </button>

            {timeFilter === "MONTH" && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-700 outline-none"
              >
                <option value="01">Janvier</option>
                <option value="02">Février</option>
                <option value="03">Mars</option>
                <option value="04">Avril</option>
                <option value="05">Mai</option>
                <option value="06">Juin</option>
                <option value="07">Juillet</option>
                <option value="08">Août</option>
                <option value="09">Septembre</option>
                <option value="10">Octobre</option>
                <option value="11">Novembre</option>
                <option value="12">Décembre</option>
              </select>
            )}

            {(timeFilter === "YEAR" || timeFilter === "MONTH") && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-700 outline-none"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            )}
          </div>
        </div>

      </div>

      {/* Tableau des paiements */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase">Référence / Date</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase">Client</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase">Livreur Responsable</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase">Mode de Paiement</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase">Montant</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase">Statut</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredPayments.map((p) => {
                const paid = isPaymentPaid(p);
                const isUpdating = updatingId === p.id;
                const deliveryMan = p.delivery?.deliveryMan;

                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-bold text-gray-900">
                        #{p.orderNumber || p.id.slice(-6)}
                      </div>
                      {p.createdAt && (
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(p.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{p.customerName || "Client Invité"}</p>
                      {p.customerPhone && <p className="text-[11px] text-gray-400 font-mono">{p.customerPhone}</p>}
                    </td>
                    <td className="px-6 py-4">
                      {deliveryMan ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                          <FiTruck className="text-emerald-600 shrink-0" size={14} />
                          <span>{deliveryMan.fullName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Non assigné</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-600">
                      {getPaymentLabel(p.paymentMethod)}
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-600">
                      {Number(p.totalAmount || 0).toFixed(2)} MAD
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 ${
                          paid
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {paid ? <FiCheckCircle size={12} /> : <FiClock size={12} />}
                        {paid ? "Payé" : "En attente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!paid ? (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleMarkAsPaid(p.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer disabled:opacity-50"
                        >
                          {isUpdating ? <FiRefreshCw className="animate-spin" /> : <FiCheck size={14} />}
                          Valider
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium italic">Réglé</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Aucun paiement trouvé pour cette période.
          </div>
        )}
      </div>
    </div>
  );
}