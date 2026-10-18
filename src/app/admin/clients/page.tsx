"use client";

import { useState, useEffect } from "react";
import { 
  FiSearch, 
  FiPhone, 
  FiMapPin, 
  FiShoppingBag, 
  FiKey, 
  FiRefreshCw, 
  FiPlus, 
  FiMessageSquare,
  FiGlobe,
  FiEdit2,
  FiTrash2,
  FiMap,
  FiX
} from "react-icons/fi";


import dynamic from "next/dynamic";
const MapComponent = dynamic(() => import("@/components/admin/ClientMapModal"), { ssr: false });

export interface ClientData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  country: string;
  city: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  clientType: string;
  loyaltyPoints: number;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // الفلاتر
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // حالة Modal (إضافة / تعديل / خريطة)
  const [showModal, setShowModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);

  // نموذج البيانات للنموذج (Form)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "Settat",
    address: "",
    clientType: "PARTICULIER",
    latitude: "",
    longitude: ""
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (selectedType) queryParams.append("type", selectedType);
      if (selectedCity) queryParams.append("city", selectedCity);

      const res = await fetch(`/api/admin/clients?${queryParams.toString()}`);
      const data = await res.json();
      if (data.clients) {
        setClients(data.clients);
        if (data.availableCities) setAvailableCities(data.availableCities);
      }
    } catch (err) {
      console.error("Erreur chargement clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, selectedType, selectedCity]);

  // فتح Modal الإضافة
  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({ name: "", phone: "", email: "", city: "Settat", address: "", clientType: "PARTICULIER", latitude: "", longitude: "" });
    setShowModal(true);
  };

  // فتح Modal التعديل
  const handleOpenEdit = (client: ClientData) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || "",
      city: client.city || "Settat",
      address: client.address || "",
      clientType: client.clientType || "PARTICULIER",
      latitude: client.latitude ? String(client.latitude) : "",
      longitude: client.longitude ? String(client.longitude) : ""
    });
    setShowModal(true);
  };

  // حفظ الكليون (Ajouter / Modifier)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = "/api/admin/clients";
    const method = editingClient ? "PUT" : "POST";
    const payload = editingClient ? { id: editingClient.id, ...formData } : formData;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        fetchClients();
      }
    } catch (err) {
      console.error("Erreur enregistrement client:", err);
    }
  };

  // حذف الكليون
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Voulez-vous vraiment supprimer le client ${name} ?`)) {
      try {
        const res = await fetch(`/api/admin/clients?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchClients();
      } catch (err) {
        console.error("Erreur suppression:", err);
      }
    }
  };

  // إعادة ضبط كلمة السر عبر واتساب
  const handleResetPassword = (client: ClientData) => {
    const newPass = Math.floor(1000 + Math.random() * 9000).toString();
    const cleanPhone = client.phone.replace(/\D/g, "");
    const message = `Bonjour ${client.name},\n\nVotre nouveau mot de passe pour accéder à votre espace *Hanout Bladi* est : *${newPass}*\n\nConnexion : https://www.hanoutbladi.ma/shop/login`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="p-6 bg-[#FAF9F5] min-h-screen space-y-6">
      
      {/* En-tête الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-extrabold text-stone-900">
            Gestion des Clients
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Portefeuille clients, carte de géolocalisation et modifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* زر عرض الخريطة */}
          <button
            onClick={() => setShowMapModal(true)}
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <FiMap size={16} /> Carte des Clients
          </button>

          {/* زر إضافة كليون */}
          <button
            onClick={handleOpenAdd}
            className="bg-[#2C3E2D] hover:bg-[#1f2b20] text-white px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <FiPlus size={16} /> Nouveau Client
          </button>
        </div>
      </div>

      {/* الفلاتر وشريط البحث */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="relative w-full lg:w-72">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher nom, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-stone-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#2C3E2D]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#FAF9F5] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 font-medium focus:outline-none"
          >
            <option value="">Tous les types</option>
            <option value="PARTICULIER">Particulier</option>
            <option value="GROSSISTE">Grossiste</option>
            <option value="REVENDEUR">Revendeur</option>
            <option value="SOCIETE">Société</option>
          </select>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-[#FAF9F5] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 font-medium focus:outline-none"
          >
            <option value="">Toutes les villes</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <button onClick={fetchClients} className="p-2 border border-stone-200 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-600">
            <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* جدول الكليونات */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-[#FAF9F5] border-b border-stone-200 font-bold uppercase tracking-wider text-stone-700">
              <tr>
                <th className="p-4">Client</th>
                <th className="p-4">Téléphone</th>
                <th className="p-4">Ville & Localisation</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-center">Commandes</th>
                <th className="p-4 text-right">Total Dépensé</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-stone-400">Chargement...</td></tr>
              ) : clients.map((client) => (
                <tr key={client.id} className="hover:bg-emerald-50/20 transition">
                  <td className="p-4 font-bold text-stone-900">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#2C3E2D]/10 text-[#2C3E2D] font-bold flex items-center justify-center text-sm">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p>{client.name}</p>
                        <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                          ⭐ {client.loyaltyPoints} pts
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-stone-800">{client.phone}</td>

                  <td className="p-4 space-y-0.5">
                    <p className="font-bold text-stone-800">{client.city}</p>
                    {client.latitude && client.longitude ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                        <FiMapPin size={10} /> Localisé
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400">Non localisé</span>
                    )}
                  </td>

                  <td className="p-4 font-bold uppercase text-[10px] text-stone-700">{client.clientType}</td>
                  <td className="p-4 text-center font-bold text-stone-800">{client.ordersCount}</td>
                  <td className="p-4 text-right font-bold text-emerald-800">{client.totalSpent.toFixed(2)} MAD</td>

                  <td className="p-4 text-center space-x-2">
                    <button onClick={() => handleOpenEdit(client)} className="p-1.5 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg">
                      <FiEdit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(client.id, client.name)} className="p-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg">
                      <FiTrash2 size={13} />
                    </button>
                    <button onClick={() => handleResetPassword(client)} className="p-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg">
                      <FiKey size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL : Ajouter / Modifier Client */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-base font-bold text-stone-900">
                {editingClient ? "Modifier le client" : "Nouveau Client"}
              </h2>
              <button onClick={() => setShowModal(false)}><FiX size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#FAF9F5] border p-2.5 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Téléphone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#FAF9F5] border p-2.5 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Ville *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#FAF9F5] border p-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Adresse détaillée</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#FAF9F5] border p-2.5 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Latitude GPS</label>
                  <input
                    type="text"
                    placeholder="Ex: 33.0012"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full bg-[#FAF9F5] border p-2.5 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Longitude GPS</label>
                  <input
                    type="text"
                    placeholder="Ex: -7.6166"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full bg-[#FAF9F5] border p-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Type de client</label>
                <select
                  value={formData.clientType}
                  onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                  className="w-full bg-[#FAF9F5] border p-2.5 rounded-xl"
                >
                  <option value="PARTICULIER">Particulier</option>
                  <option value="GROSSISTE">Grossiste</option>
                  <option value="REVENDEUR">Revendeur</option>
                  <option value="SOCIETE">Société</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-full">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#2C3E2D] text-white font-bold rounded-full">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : الخريطة التفاعلية */}
      {showMapModal && (
        <MapComponent clients={clients} onClose={() => setShowMapModal(false)} />
      )}

    </div>
  );
}