"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FiSearch, FiTruck, FiMapPin, FiPlus, FiTrash2, FiPackage } from "react-icons/fi";

interface Delivery {
  id: string;
  trackingNumber: string;
  status: string;
  shippingFee: number;
  order: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    city: string;
    address: string;
    shippingMode: string;
  };
  deliveryMan?: {
    id: string;
    fullName: string;
    phone: string;
  } | null;
}

interface DeliveryMan {
  id: string;
  fullName: string;
  phone: string;
  zone: string;
  vehicle?: string;
  status?: string;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  city: string;
  shippingMode: string;
}

export default function AdminDeliveriesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Formulaire d'assignation rapide
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedDeliveryManId, setSelectedDeliveryManId] = useState("");
  const [shippingFee, setShippingFee] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  // Modal d'ajout rapide d'un nouveau livreur
  const [showNewManModal, setShowNewManModal] = useState(false);
  const [manFullName, setManFullName] = useState("");
  const [manPhone, setManPhone] = useState("");
  const [manZone, setManZone] = useState("Settat et environs");
  const [manVehicle, setManVehicle] = useState("Scooter");
  const [manStatus, setManStatus] = useState("Disponible");
  const [submittingMan, setSubmittingMan] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [delivRes, menRes, ordRes] = await Promise.all([
        fetch("/api/admin/deliveries"),
        fetch("/api/admin/delivery-men"),
        fetch("/api/admin/orders?unassigned=true"),
      ]);

      if (delivRes.ok) {
        const data = await delivRes.json();
        setDeliveries(Array.isArray(data) ? data : []);
      }
      if (menRes.ok) {
        const data = await menRes.json();
        setDeliveryMen(Array.isArray(data) ? data : []);
      }
      if (ordRes.ok) {
        const data = await ordRes.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast.error("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return toast.error("Veuillez choisir une commande.");

    const chosenOrder = orders.find((o) => o.id === selectedOrderId);
    const isStandard = !chosenOrder || chosenOrder.shippingMode === "standard";

    if (isStandard && !selectedDeliveryManId) {
      return toast.error("Cette commande est en mode Standard. Veuillez lui assigner un livreur interne.");
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderId,
          deliveryManId: isStandard ? selectedDeliveryManId : null,
          shippingFee: Number(shippingFee),
        }),
      });

      if (res.ok) {
        toast.success("Livraison créée avec succès !");
        setSelectedOrderId("");
        setSelectedDeliveryManId("");
        setShippingFee("0");
        setShowForm(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de la création");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateDeliveryMan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manFullName.trim() || !manPhone.trim()) {
      toast.error("Le nom et le téléphone sont obligatoires.");
      return;
    }

    try {
      setSubmittingMan(true);
      const res = await fetch("/api/admin/delivery-men", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: manFullName.trim(),
          phone: manPhone.trim(),
          zone: manZone,
          vehicle: manVehicle,
          status: manStatus,
        }),
      });

      if (res.ok) {
        const newMan = await res.json();
        toast.success("Livreur ajouté avec succès !");

        await fetchData();
        setSelectedDeliveryManId(newMan.id);

        setManFullName("");
        setManPhone("");
        setManZone("Settat et environs");
        setManVehicle("Scooter");
        setManStatus("Disponible");
        setShowNewManModal(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de la création du livreur.");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setSubmittingMan(false);
    }
  };

  const updateDelivery = async (id: string, updatedFields: { status?: string; deliveryManId?: string }) => {
    try {
      const res = await fetch(`/api/admin/deliveries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });

      if (res.ok) {
        toast.success("Livraison mise à jour !");
        fetchData();
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  const handleDelete = async (id: string, tracking: string) => {
    if (!confirm(`Supprimer la livraison ${tracking} ?`)) return;

    try {
      const res = await fetch(`/api/admin/deliveries/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Livraison supprimée !");
        setDeliveries((prev) => prev.filter((d) => d.id !== id));
      } else {
        toast.error("Erreur de suppression");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  // Filtrage : Masque automatiquement les livraisons dont le statut est "Livré"
  const filteredDeliveries = deliveries.filter((d) => {
    if (d.status === "Livré") return false;

    const term = searchTerm.toLowerCase();
    const tracking = d.trackingNumber?.toLowerCase() || "";
    const customer = d.order?.customerName?.toLowerCase() || "";
    const city = d.order?.city?.toLowerCase() || "";
    const deliveryMan = d.deliveryMan?.fullName?.toLowerCase() || "";

    return tracking.includes(term) || customer.includes(term) || city.includes(term) || deliveryMan.includes(term);
  });

  const selectedOrderDetails = orders.find((o) => o.id === selectedOrderId);
  const isSelectedOrderStandard = !selectedOrderDetails || selectedOrderDetails.shippingMode === "standard";

  if (status === "loading" || loading) {
    return <div className="p-12 text-center text-gray-400 font-medium">Chargement des livraisons...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Livraisons en Cours</h1>
          <p className="text-xs text-gray-500 mt-1">Total en cours : {filteredDeliveries.length} livraison(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewManModal(true)}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm cursor-pointer"
          >
            + Ajouter un Livreur
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <FiPlus size={18} /> {showForm ? "Fermer" : "Nouvelle livraison"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Créer & Assigner une Livraison</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Commande *</label>
              <select
                required
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Choisir une commande --</option>
                {orders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    {ord.orderNumber} - {ord.customerName} ({ord.city}) [{ord.shippingMode.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Livreur Assigné {isSelectedOrderStandard ? "*" : "(Non requis - Transporteur Externe)"}
              </label>
              {isSelectedOrderStandard ? (
                <select
                  required={isSelectedOrderStandard}
                  value={selectedDeliveryManId}
                  onChange={(e) => setSelectedDeliveryManId(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">-- Choisir un livreur interne --</option>
                  {deliveryMen.map((man) => (
                    <option key={man.id} value={man.id}>
                      {man.fullName} ({man.zone})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                  Mode {selectedOrderDetails?.shippingMode?.toUpperCase()} : Aucun livreur interne nécessaire.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Frais de port (MAD)</label>
              <input
                type="number"
                step="0.01"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Création..." : "Enregistrer la livraison"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showNewManModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg border-b pb-3">Ajouter un nouveau livreur</h3>
            
            <form onSubmit={handleCreateDeliveryMan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  value={manFullName}
                  onChange={(e) => setManFullName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: Youssef Benali"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Téléphone *</label>
                <input
                  type="text"
                  value={manPhone}
                  onChange={(e) => setManPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+212 6..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Zone</label>
                  <input
                    type="text"
                    value={manZone}
                    onChange={(e) => setManZone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Véhicule</label>
                  <select
                    value={manVehicle}
                    onChange={(e) => setManVehicle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Scooter">Scooter</option>
                    <option value="Moto">Moto</option>
                    <option value="Voiture">Voiture</option>
                    <option value="Camionnette">Camionnette</option>
                    <option value="Vélo">Vélo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Statut initial</label>
                <select
                  value={manStatus}
                  onChange={(e) => setManStatus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="En livraison">En livraison</option>
                  <option value="Hors ligne">Hors ligne</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewManModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingMan}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {submittingMan ? "Création..." : "Enregistrer le livreur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-3">
        <FiSearch className="text-gray-400 text-lg ml-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par n° de suivi, client, ville ou livreur..."
          className="w-full bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-400"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Suivi / Mode</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Client & Adresse</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Frais de port</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Livreur Assigné</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Statut</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDeliveries.map((deliv) => {
              const isStandardMode = !deliv.order?.shippingMode || deliv.order.shippingMode === "standard";

              return (
                <tr key={deliv.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <FiTruck className="text-emerald-600" size={16} />
                      {deliv.trackingNumber}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <span>Réf : {deliv.order?.orderNumber}</span>
                      <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                        {deliv.order?.shippingMode || "standard"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-semibold text-gray-900">{deliv.order?.customerName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <FiMapPin size={12} className="text-gray-400" /> {deliv.order?.address}, {deliv.order?.city}
                    </div>
                  </td>
                  
                  {/* Frais de port fixes en MAD */}
                  <td className="px-4 py-3 text-sm font-bold text-emerald-600">
                    {Number(deliv.shippingFee || 0).toFixed(2)} MAD
                  </td>

                  <td className="px-4 py-3 text-sm font-medium text-gray-700">
                    {isStandardMode ? (
                      <select
                        value={deliv.deliveryMan?.id || ""}
                        onChange={(e) => updateDelivery(deliv.id, { deliveryManId: e.target.value || undefined })}
                        className="border border-gray-200 rounded-xl p-2 text-xs bg-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Choisir un livreur --</option>
                        {deliveryMen.map((man) => (
                          <option key={man.id} value={man.id}>
                            {man.fullName} ({man.zone})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold">
                        <FiPackage size={12} /> Transporteur {deliv.order?.shippingMode?.toUpperCase()} (Externe)
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs">
                    <select
                      value={deliv.status}
                      onChange={(e) => updateDelivery(deliv.id, { status: e.target.value })}
                      className={`border rounded-xl p-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer ${
                        deliv.status === "Livré"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : deliv.status === "En cours"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      <option value="En attente">En attente</option>
                      <option value="En cours">En cours</option>
                      <option value="Livré">Livré</option>
                      <option value="Échoué">Échoué</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(deliv.id, deliv.trackingNumber)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <FiTrash2 size={14} /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredDeliveries.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Aucune livraison en cours.
          </div>
        )}
      </div>
    </div>
  );
}