// =============================================================
// PAGE ADMIN ARCHIVES - Historique des commandes payées et terminées
// =============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FiSearch, FiArchive, FiCheckCircle, FiTruck, FiRefreshCw } from "react-icons/fi";

interface ArchiveOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  city: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  delivery?: {
    trackingNumber: string;
    shippingFee: number;
    deliveryMan?: {
      fullName: string;
    } | null;
  } | null;
}

export default function AdminArchivesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [archives, setArchives] = useState<ArchiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  const fetchArchives = useCallback(async () => {
    try {
      setLoading(true);
      // On interroge l'API des commandes en filtrant uniquement sur le statut ARCHIVED
      const res = await fetch("/api/admin/orders?status=ARCHIVED");
      if (res.ok) {
        const data = await res.json();
        setArchives(Array.isArray(data) ? data : []);
      } else {
        toast.error("Erreur lors du chargement des archives");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchArchives();
    }
  }, [status, fetchArchives]);

  const filteredArchives = archives.filter((item) => {
    const term = searchTerm.toLowerCase();
    const orderNo = item.orderNumber?.toLowerCase() || "";
    const customer = item.customerName?.toLowerCase() || "";
    const phone = item.customerPhone?.toLowerCase() || "";
    const city = item.city?.toLowerCase() || "";
    return orderNo.includes(term) || customer.includes(term) || phone.includes(term) || city.includes(term);
  });

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-400 text-sm font-medium">
        <FiRefreshCw className="animate-spin mr-2 text-emerald-600" size={18} /> Chargement des archives...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-stone-100 text-stone-700 rounded-xl">
              <FiArchive size={20} />
            </div>
            <h1 className="text-2xl font-black text-stone-900">Archives des Commandes</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Historique sécurisé de toutes les ventes payées, livrées et clôturées ({filteredArchives.length} archive(s))
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-3">
        <FiSearch className="text-stone-400 text-lg ml-2 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par n° de commande, client, téléphone ou ville..."
          className="w-full bg-transparent text-sm focus:outline-none text-stone-800 placeholder-stone-400"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="text-xs text-stone-400 hover:text-stone-600 px-2 py-1 bg-stone-100 rounded-lg cursor-pointer shrink-0"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Tableau des archives */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-stone-600 uppercase">N° Commande</th>
                <th className="px-6 py-3.5 text-xs font-bold text-stone-600 uppercase">Client & Ville</th>
                <th className="px-6 py-3.5 text-xs font-bold text-stone-600 uppercase">Suivi / Livreur</th>
                <th className="px-6 py-3.5 text-xs font-bold text-stone-600 uppercase">Paiement</th>
                <th className="px-6 py-3.5 text-xs font-bold text-stone-600 uppercase">Montant Total</th>
                <th className="px-6 py-3.5 text-xs font-bold text-stone-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {filteredArchives.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50 transition">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-stone-900">
                    #{item.orderNumber}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-stone-800">{item.customerName}</p>
                    <p className="text-xs text-stone-400">{item.city} {item.customerPhone ? `• ${item.customerPhone}` : ""}</p>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {item.delivery ? (
                      <div>
                        <span className="font-mono font-bold text-stone-700">{item.delivery.trackingNumber}</span>
                        <p className="text-stone-400 mt-0.5">
                          {item.delivery.deliveryMan ? `Livreur : ${item.delivery.deliveryMan.fullName}` : "Transporteur externe"}
                        </p>
                      </div>
                    ) : (
                      <span className="text-stone-400 italic">Aucune livraison</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-stone-600">
                    <span className="px-2.5 py-1 bg-stone-100 rounded-lg text-stone-700 font-semibold">
                      {item.paymentMethod || "Non spécifié"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-emerald-700">
                    {Number(item.totalAmount || 0).toFixed(2)} MAD
                  </td>
                  <td className="px-6 py-4 text-xs text-stone-500 font-medium">
                    {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredArchives.length === 0 && (
          <div className="text-center py-16 text-stone-400 text-sm">
            Aucune commande archivée pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}