// =============================================================
// PAGE ADMIN : NOUVELLE COMMANDE (Adresse si Livraison / Heure si Retrait)
// =============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiRefreshCw, FiShoppingBag, FiClock, FiMapPin } from "react-icons/fi";

interface Department {
  id: string;
  name_fr: string;
}

interface Category {
  id: string;
  name_fr: string;
  departmentId: string;
}

interface Product {
  id: string;
  name_fr: string;
  price: number;
  stock: number;
  categoryId: string;
}

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export default function NewAdminOrderPage() {
  const { status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  // Données du catalogue
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Formulaire client & logistique
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  
  // Logistique conditionnelle
  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "onsite">("delivery");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Settat");
  const [pickupTime, setPickupTime] = useState(""); // Heure de retrait si onsite
  const [pickupDate, setPickupDate] = useState(""); // Date de retrait si onsite

  const [shippingMode, setShippingMode] = useState("standard");
  const [shippingFee, setShippingFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [notes, setNotes] = useState("");

  // Sélection active pour l'ajout de produit
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [selectedProdId, setSelectedProdId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  // Tableau récapitulatif des articles
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchCatalogData() {
      try {
        setFetchingData(true);
        const [deptRes, catRes, prodRes] = await Promise.all([
          fetch("/api/admin/departments").catch(() => null),
          fetch("/api/admin/categories").catch(() => null),
          fetch("/api/admin/products").catch(() => null),
        ]);

        if (deptRes && deptRes.ok) {
          const data = await deptRes.json();
          setDepartments(Array.isArray(data) ? data : []);
        }
        if (catRes && catRes.ok) {
          const data = await catRes.json();
          setCategories(Array.isArray(data) ? data : []);
        }
        if (prodRes && prodRes.ok) {
          const data = await prodRes.json();
          setProducts(Array.isArray(data) ? data : data.products || []);
        }
      } catch (err) {
        console.error("Erreur de chargement du catalogue:", err);
        toast.error("Erreur lors du chargement des données.");
      } finally {
        setFetchingData(false);
      }
    }

    if (status === "authenticated") {
      fetchCatalogData();
    }
  }, [status]);

  const handleAddProductToOrder = () => {
    if (!selectedProdId) {
      toast.error("Veuillez sélectionner un produit.");
      return;
    }

    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) {
      toast.error("Produit introuvable.");
      return;
    }

    const qty = Number(selectedQuantity) || 1;
    if (qty <= 0) {
      toast.error("La quantité doit être supérieure à 0.");
      return;
    }

    if (prod.stock < qty) {
      toast.error(`Stock insuffisant ! Disponible : ${prod.stock}`);
      return;
    }

    setOrderItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === prod.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: prod.id,
            productName: prod.name_fr,
            quantity: qty,
            price: Number(prod.price) || 0,
          },
        ];
      }
    });

    setSelectedProdId("");
    setSelectedQuantity(1);
    toast.success("Produit ajouté à la liste.");
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const productsTotal = orderItems.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
  const activeShippingFee = fulfillmentType === "onsite" ? 0 : Number(shippingFee || 0);
  const grandTotal = productsTotal + activeShippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Veuillez remplir le nom et le téléphone du client.");
      return;
    }

    // Validation conditionnelle selon le mode
    if (fulfillmentType === "delivery" && !address.trim()) {
      toast.error("Veuillez renseigner l'adresse de livraison.");
      return;
    }

    if (fulfillmentType === "onsite" && (!pickupDate || !pickupTime)) {
      toast.error("Veuillez indiquer la date et l'heure prévues pour le retrait.");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Veuillez ajouter au moins un produit à la commande.");
      return;
    }

    setLoading(true);

    try {
      // Si retrait sur place, on formate les notes pour y inclure l'heure et la date de retrait
      const finalNotes = fulfillmentType === "onsite"
        ? `[RETRAIT MAGASIN] Prévu le ${pickupDate} à ${pickupTime}${notes ? ` - Note: ${notes}` : ""}`
        : notes.trim() || null;

      const finalAddress = fulfillmentType === "delivery" ? address.trim() : "Retrait en magasin - Hanout Bladi";
      const finalCity = fulfillmentType === "delivery" ? city.trim() : "Settat (Magasin)";

      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || null,
        address: finalAddress,
        city: finalCity,
        shippingMode: fulfillmentType === "onsite" ? "onsite" : shippingMode,
        paymentMethod,
        shippingFee: activeShippingFee,
        notes: finalNotes,
        totalAmount: grandTotal,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Commande créée avec succès !");
        router.push("/admin/orders");
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de la création de la commande.");
      }
    } catch (error) {
      toast.error("Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || fetchingData) {
    return <div className="p-12 text-center text-stone-400 font-medium">Chargement des données...</div>;
  }

  const filteredCategories = categories.filter(
    (cat) => !selectedDept || cat.departmentId === selectedDept
  );
  const filteredProducts = products.filter(
    (prod) => !selectedCat || prod.categoryId === selectedCat
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 selection:bg-[#2C3E2D] selection:text-white">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="p-2.5 bg-white rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50">
          <FiArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-stone-900">Nouvelle Commande Admin</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-8">
        
        {/* SECTION 1 : Type de Retrait & Infos Client */}
        <div>
          <h3 className="text-xs font-bold text-[#C5A059] uppercase tracking-wider mb-4 pb-2 border-b border-stone-100">
            1. Mode de Récupération & Client
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Boutons de bascule Livraison vs Retrait */}
            <div className="md:col-span-2 flex gap-3 bg-stone-50 p-2 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => setFulfillmentType("delivery")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  fulfillmentType === "delivery" 
                    ? "bg-[#2C3E2D] text-white shadow-xs" 
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                🚚 Livraison à domicile
              </button>
              <button
                type="button"
                onClick={() => {
                  setFulfillmentType("onsite");
                  setShippingFee(0);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  fulfillmentType === "onsite" 
                    ? "bg-[#2C3E2D] text-white shadow-xs" 
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                🏪 Retrait sur place (Magasin)
              </button>
            </div>

            <input
              type="text"
              required
              placeholder="Nom complet du client *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#2C3E2D]"
            />
            <input
              type="text"
              required
              placeholder="Téléphone *"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#2C3E2D]"
            />

            {/* SECTION CONDITIONNELLE : Adresse si Livraison / Heure si Retrait */}
            {fulfillmentType === "delivery" ? (
              <>
                <textarea
                  required
                  placeholder="Adresse complète de livraison *"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="md:col-span-2 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#2C3E2D]"
                />
                <input
                  type="text"
                  placeholder="Ville"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#2C3E2D]"
                />
                <select
                  value={shippingMode}
                  onChange={(e) => setShippingMode(e.target.value)}
                  className="border border-stone-200 rounded-xl p-3 text-xs bg-white focus:outline-none cursor-pointer font-semibold text-stone-700"
                >
                  <option value="standard">🚚 Livreur Interne</option>
                  <option value="amana">📦 Amana (Externe)</option>
                  <option value="express">⚡ Express</option>
                </select>
              </>
            ) : (
              <div className="md:col-span-2 bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2C3E2D]">
                  <FiClock size={16} /> Précisez la date et l'heure du retrait en magasin :
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">Date de retrait *</label>
                    <input
                      type="date"
                      required
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full border border-stone-200 rounded-xl p-3 text-xs bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">Heure de retrait *</label>
                    <input
                      type="time"
                      required
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full border border-stone-200 rounded-xl p-3 text-xs bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* SECTION 2 : Sélection et Ajout des Produits */}
        <div>
          <div className="mb-4 pb-3 border-b border-stone-100">
            <h3 className="text-xs font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-2">
              <FiShoppingBag /> 2. Sélection et Ajout des Produits
            </h3>
            <p className="text-[11px] text-stone-400 mt-0.5">Choisissez un département, une catégorie et un produit, puis cliquez sur "Ajouter"</p>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">Département</label>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setSelectedCat("");
                    setSelectedProdId("");
                  }}
                  className="w-full border border-stone-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choisir département --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name_fr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">Catégorie</label>
                <select
                  value={selectedCat}
                  onChange={(e) => {
                    setSelectedCat(e.target.value);
                    setSelectedProdId("");
                  }}
                  disabled={!selectedDept}
                  className="w-full border border-stone-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none disabled:opacity-50 cursor-pointer"
                >
                  <option value="">-- Choisir catégorie --</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name_fr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">Produit *</label>
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  disabled={!selectedCat}
                  className="w-full border border-stone-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none disabled:opacity-50 cursor-pointer font-semibold text-stone-900"
                >
                  <option value="">-- Choisir produit --</option>
                  {filteredProducts.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name_fr} ({prod.price} MAD - Stock: {prod.stock})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="w-full sm:w-48">
                <label className="block text-[10px] font-bold text-stone-500 mb-1">Quantité</label>
                <input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Number(e.target.value) || 1)}
                  className="w-full border border-stone-200 rounded-xl p-2 text-xs bg-white text-center font-extrabold focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAddProductToOrder}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#2C3E2D] hover:bg-[#1a261c] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <FiPlus size={16} /> Ajouter à la liste
              </button>
            </div>
          </div>

          {/* TABLEAU RÉCAPITULATIF */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="p-4 bg-stone-50 border-b border-stone-200 font-bold text-stone-700 text-xs">
              📋 Articles sélectionnés ({orderItems.length})
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs">Aucun produit ajouté pour le moment. Utilisez la bannière ci-dessus.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 text-stone-400 text-[10px] uppercase tracking-wider">
                      <th className="p-3">Produit</th>
                      <th className="p-3">Quantité</th>
                      <th className="p-3">Prix Unitaire</th>
                      <th className="p-3">Total Ligne</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {orderItems.map((item, index) => (
                      <tr key={index} className="hover:bg-stone-50/50">
                        <td className="p-3 font-bold text-stone-900">{item.productName}</td>
                        <td className="p-3 font-extrabold text-[#2C3E2D]">{item.quantity}</td>
                        <td className="p-3">{item.price} MAD</td>
                        <td className="p-3 font-black text-stone-900">{(item.quantity * item.price).toFixed(2)} MAD</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                            title="Supprimer la ligne"
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

          {/* SOUS-TOTAL ET TOTAUX */}
          <div className="mt-6 p-5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col items-end text-xs space-y-2 text-stone-700">
            <div className="flex justify-between w-full sm:w-80">
              <span>Sous-total produits :</span>
              <span className="font-bold text-stone-900">{productsTotal.toFixed(2)} MAD</span>
            </div>

            {fulfillmentType === "delivery" && (
              <div className="flex justify-between items-center w-full sm:w-80">
                <span>Frais de livraison :</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(Number(e.target.value) || 0)}
                    className="w-24 border border-stone-200 rounded-lg p-1.5 text-right text-xs font-bold bg-white"
                  />
                  <span className="text-[11px] font-semibold">MAD</span>
                </div>
              </div>
            )}

            <div className="flex justify-between w-full sm:w-80 text-sm font-black text-stone-900 pt-3 border-t border-stone-200">
              <span>Montant Total Global :</span>
              <span className="text-[#2C3E2D] text-base">{grandTotal.toFixed(2)} MAD</span>
            </div>
          </div>
        </div>

        {/* SECTION 3 : Paiement & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Mode de Paiement</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-stone-200 rounded-xl p-3 text-xs bg-white focus:outline-none font-medium cursor-pointer"
            >
              <option value="cash_on_delivery">💵 Paiement à la livraison / sur place</option>
              <option value="bank_transfer">🏦 Virement Bancaire</option>
              <option value="cash_plus">⚡ CashPlus / WafaCash</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Notes / Instructions</label>
            <input
              type="text"
              placeholder="Ex: Instructions pour la commande..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#2C3E2D]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
          <Link href="/admin/orders" className="px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition">
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#2C3E2D] hover:bg-[#1a261c] text-white font-bold text-xs transition flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? <FiRefreshCw className="animate-spin" size={15} /> : <FiSave size={15} />}
            {loading ? "Création en cours..." : "Valider la commande"}
          </button>
        </div>
      </form>
    </div>
  );
}