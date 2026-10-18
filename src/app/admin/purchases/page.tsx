"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiFileText } from "react-icons/fi";

interface Department {
  id: string;
  name_fr: string;
  name_ar?: string | null;
  description_fr?: string | null;
  description_ar?: string | null;
  image?: string | null;
  isActive?: boolean;
}

interface Category {
  id: string;
  name_fr: string;
  name_ar?: string | null;
  description_fr?: string | null;
  description_ar?: string | null;
  departmentId?: string;
  department?: { id: string } | null;
  image?: string | null;
  isActive?: boolean;
}

interface Product {
  id: string;
  name_fr: string;
  name_ar?: string | null;
  description_fr?: string | null;
  description_ar?: string | null;
  price: number;
  oldPrice?: number | null;
  stock?: number;
  unit?: string;
  categoryId?: string;
  category?: { id: string; departmentId?: string; department?: { id: string } } | null;
  departmentId?: string;
  department?: { id: string } | null;
  image?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  sku?: string | null;
  lastPurchasePrice?: number | null;
}

interface Supplier {
  id: string;
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}

interface PurchaseItem {
  departmentId: string;
  categoryId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface Purchase {
  id: string;
  productName: string;
  supplierName: string;
  quantity: number;
  totalCost: number;
  status: string;
  notes?: string | null;
  createdAt?: string;
}

export default function AdminPurchasesPage() {
  const { status } = useSession();
  const router = useRouter();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showNewPurchaseModal, setShowNewPurchaseModal] = useState(false);
  const [showNewDeptModal, setShowNewDeptModal] = useState(false);
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);

  // Formulaire Achat Global
  const [purSupplierId, setPurSupplierId] = useState("");
  const [purStatus, setPurStatus] = useState("Livré");
  const [purNotes, setPurNotes] = useState("");
  
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([
    { departmentId: "", categoryId: "", productId: "", quantity: 1, unitCost: 0, totalCost: 0 }
  ]);

  // Formulaire Département
  const [newDeptNameFr, setNewDeptNameFr] = useState("");
  const [newDeptNameAr, setNewDeptNameAr] = useState("");
  const [newDeptDescFr, setNewDeptDescFr] = useState("");
  const [newDeptDescAr, setNewDeptDescAr] = useState("");
  const [newDeptImage, setNewDeptImage] = useState("");
  const [newDeptIsActive, setNewDeptIsActive] = useState(true);

  // Formulaire Catégorie
  const [newCatNameFr, setNewCatNameFr] = useState("");
  const [newCatNameAr, setNewCatNameAr] = useState("");
  const [newCatDescFr, setNewCatDescFr] = useState("");
  const [newCatDescAr, setNewCatDescAr] = useState("");
  const [newCatDeptId, setNewCatDeptId] = useState("");
  const [newCatImage, setNewCatImage] = useState("");
  const [newCatIsActive, setNewCatIsActive] = useState(true);

  // Formulaire Produit
  const [newProdNameFr, setNewProdNameFr] = useState("");
  const [newProdNameAr, setNewProdNameAr] = useState("");
  const [newProdDescFr, setNewProdDescFr] = useState("");
  const [newProdDescAr, setNewProdDescAr] = useState("");
  const [newProdPrice, setNewProdPrice] = useState<number>(0);
  const [newProdOldPrice, setNewProdOldPrice] = useState<number>(0);
  const [newProdStock, setNewProdStock] = useState<number>(0);
  const [newProdUnit, setNewProdUnit] = useState("Pièce");
  const [newProdCatId, setNewProdCatId] = useState("");
  const [newProdDeptId, setNewProdDeptId] = useState("");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdIsActive, setNewProdIsActive] = useState(true);
  const [newProdIsFeatured, setNewProdIsFeatured] = useState(false);
  const [newProdSku, setNewProdSku] = useState("");

  // Formulaire Fournisseur
  const [newSuppName, setNewSuppName] = useState("");
  const [newSuppCompanyName, setNewSuppCompanyName] = useState("");
  const [newSuppEmail, setNewSuppEmail] = useState("");
  const [newSuppPhone, setNewSuppPhone] = useState("");
  const [newSuppAddress, setNewSuppAddress] = useState("");
  const [newSuppNotes, setNewSuppNotes] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/admin/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchInitialData();
    }
  }, [status]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [purRes, prodRes, suppRes, catRes, deptRes] = await Promise.all([
        fetch("/api/admin/purchases").catch(() => null),
        fetch("/api/admin/products").catch(() => null),
        fetch("/api/admin/suppliers").catch(() => null),
        fetch("/api/admin/categories").catch(() => null),
        fetch("/api/admin/departments").catch(() => null),
      ]);

      if (purRes && purRes.ok) setPurchases(await purRes.json());
      if (prodRes && prodRes.ok) {
        const pData = await prodRes.json();
        setProducts(Array.isArray(pData) ? pData : pData.products || []);
      }
      if (suppRes && suppRes.ok) setSuppliers(await suppRes.json());
      if (catRes && catRes.ok) setCategories(await catRes.json());
      if (deptRes && deptRes.ok) setDepartments(await deptRes.json());
    } catch {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setPurchaseItems([
      ...purchaseItems,
      { departmentId: "", categoryId: "", productId: "", quantity: 1, unitCost: 0, totalCost: 0 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (purchaseItems.length === 1) return toast.error("Il faut au moins un produit dans l'achat.");
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    const updated = [...purchaseItems];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "productId") {
      const foundProd = products.find((p) => p.id === value);
      if (foundProd) {
        updated[index].unitCost = foundProd.lastPurchasePrice ?? 0;
      }
    }

    const q = Number(updated[index].quantity) || 0;
    const uc = Number(updated[index].unitCost) || 0;
    updated[index].totalCost = Number((q * uc).toFixed(2));

    setPurchaseItems(updated);
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptNameFr.trim()) return toast.error("Nom FR obligatoire.");
    try {
      const res = await fetch("/api/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_fr: newDeptNameFr.trim(),
          name_ar: newDeptNameAr.trim() || null,
          description_fr: newDeptDescFr.trim() || null,
          description_ar: newDeptDescAr.trim() || null,
          image: newDeptImage.trim() || null,
          isActive: newDeptIsActive,
        }),
      });
      if (res.ok) {
        toast.success("Département créé !");
        setShowNewDeptModal(false);
        setNewDeptNameFr("");
        setNewDeptNameAr("");
        fetchInitialData();
      } else {
        toast.error("Erreur création département");
      }
    } catch {
      toast.error("Erreur serveur");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameFr.trim() || !newCatDeptId) return toast.error("Nom et département obligatoires.");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_fr: newCatNameFr.trim(),
          name_ar: newCatNameAr.trim() || null,
          description_fr: newCatDescFr.trim() || null,
          description_ar: newCatDescAr.trim() || null,
          departmentId: newCatDeptId,
          image: newCatImage.trim() || null,
          isActive: newCatIsActive,
        }),
      });
      if (res.ok) {
        toast.success("Catégorie créée !");
        setShowNewCatModal(false);
        setNewCatNameFr("");
        setNewCatNameAr("");
        fetchInitialData();
      } else {
        toast.error("Erreur création catégorie");
      }
    } catch {
      toast.error("Erreur serveur");
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdNameFr.trim() || !newProdCatId) return toast.error("Nom et catégorie obligatoires.");
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_fr: newProdNameFr.trim(),
          name_ar: newProdNameAr.trim() || null,
          description_fr: newProdDescFr.trim() || null,
          description_ar: newProdDescAr.trim() || null,
          price: Number(newProdPrice),
          oldPrice: Number(newProdOldPrice) || null,
          stock: Number(newProdStock),
          unit: newProdUnit,
          categoryId: newProdCatId,
          departmentId: newProdDeptId || null,
          image: newProdImage.trim() || null,
          isActive: newProdIsActive,
          isFeatured: newProdIsFeatured,
          sku: newProdSku.trim() || null,
        }),
      });
      if (res.ok) {
        toast.success("Produit créé !");
        setShowNewProductModal(false);
        setNewProdNameFr("");
        setNewProdPrice(0);
        setNewProdStock(0);
        fetchInitialData();
      } else {
        toast.error("Erreur création produit");
      }
    } catch {
      toast.error("Erreur serveur");
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuppName.trim()) return toast.error("Nom du fournisseur obligatoire.");
    try {
      const res = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSuppName.trim(),
          companyName: newSuppCompanyName.trim() || null,
          email: newSuppEmail.trim() || null,
          phone: newSuppPhone.trim() || null,
          address: newSuppAddress.trim() || null,
          notes: newSuppNotes.trim() || null,
        }),
      });
      if (res.ok) {
        toast.success("Fournisseur créé !");
        setShowNewSupplierModal(false);
        setNewSuppName("");
        fetchInitialData();
      } else {
        toast.error("Erreur création fournisseur");
      }
    } catch {
      toast.error("Erreur serveur");
    }
  };

  const handleCreateMultiPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purSupplierId) return toast.error("Veuillez sélectionner un fournisseur.");

    for (const item of purchaseItems) {
      if (!item.productId || item.quantity <= 0) {
        return toast.error("Chaque ligne doit comporter un produit valide et une quantité valide.");
      }
    }

    const selectedSupp = suppliers.find((s) => s.id === purSupplierId);

    try {
      const res = await fetch("/api/admin/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: purSupplierId,
          supplierName: selectedSupp ? selectedSupp.name : "Fournisseur",
          status: purStatus,
          notes: purNotes.trim() || null,
          items: purchaseItems,
        }),
      });

      if (res.ok) {
        toast.success("Achats enregistrés et stocks mis à jour !");
        setShowNewPurchaseModal(false);
        setPurSupplierId("");
        setPurNotes("");
        setPurchaseItems([{ departmentId: "", categoryId: "", productId: "", quantity: 1, unitCost: 0, totalCost: 0 }]);
        fetchInitialData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de l'enregistrement");
      }
    } catch {
      toast.error("Erreur serveur");
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-12 text-center text-gray-400 font-medium">Chargement des données...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Gestion des Approvisionnements</h1>
          <p className="text-xs text-gray-500">Enregistrez vos factures d'achats multi-produits avec filtres en cascade et création rapide.</p>
        </div>
        <button
          onClick={() => setShowNewPurchaseModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <FiPlus size={16} /> Nouvel Achat Multi-Produits
        </button>
      </div>

      {/* MODAL PRINCIPALE : NOUVEL ACHAT */}
      {showNewPurchaseModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 space-y-5 shadow-xl my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 text-lg border-b pb-3">Enregistrer un bon d'achat / approvisionnement</h3>
            
            <form onSubmit={handleCreateMultiPurchase} className="space-y-5">
              
              {/* Infos Fournisseur & Facture */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700">Fournisseur *</label>
                    <button type="button" onClick={() => setShowNewSupplierModal(true)} className="text-[11px] text-emerald-600 font-bold hover:underline cursor-pointer">
                      + Créer Fournisseur
                    </button>
                  </div>
                  <select
                    value={purSupplierId}
                    onChange={(e) => setPurSupplierId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm cursor-pointer"
                    required
                  >
                    <option value="">-- Choisir un fournisseur --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} {s.companyName ? `(${s.companyName})` : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Statut</label>
                  <select
                    value={purStatus}
                    onChange={(e) => setPurStatus(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm cursor-pointer"
                  >
                    <option value="Livré">Livré</option>
                    <option value="En attente de livraison">En attente de livraison</option>
                    <option value="Commandé">Commandé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Notes / Référence facture</label>
                  <input
                    type="text"
                    value={purNotes}
                    onChange={(e) => setPurNotes(e.target.value)}
                    placeholder="Réf..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* LIGNES D'ACHAT AVEC FILTRES EN CASCADE */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-gray-800">Lignes de produits achetés</h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <FiPlus size={14} /> Ajouter un autre produit
                  </button>
                </div>

                <div className="space-y-3">
                  {purchaseItems.map((item, index) => {
                    // Filtrage robuste en cascade par ligne pour les catégories
                    const filteredCats = categories.filter((c: any) => {
                      if (!item.departmentId) return true;
                      const deptIdCat = c.departmentId || c.department?.id || c.department_id;
                      return String(deptIdCat) === String(item.departmentId);
                    });

                    // Filtrage robuste en cascade par ligne pour les produits
                    const filteredProds = products.filter((p: any) => {
                      if (item.categoryId) {
                        const catIdProd = p.categoryId || p.category?.id || p.category_id;
                        return String(catIdProd) === String(item.categoryId);
                      }
                      if (item.departmentId) {
                        const deptIdProd = p.departmentId || p.department?.id || p.category?.departmentId || p.category?.department?.id;
                        return String(deptIdProd) === String(item.departmentId);
                      }
                      return true;
                    });

                    const selectedProductObj = products.find((p) => p.id === item.productId);

                    return (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl border border-gray-200 bg-white shadow-xs items-end">
                        
                        {/* Département */}
                        <div className="md:col-span-2">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[11px] font-bold text-gray-600">Département</label>
                            <button type="button" onClick={() => setShowNewDeptModal(true)} className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer">
                              + Créer
                            </button>
                          </div>
                          <select
                            value={item.departmentId}
                            onChange={(e) => {
                              handleItemChange(index, "departmentId", e.target.value);
                              handleItemChange(index, "categoryId", "");
                              handleItemChange(index, "productId", "");
                            }}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer"
                          >
                            <option value="">-- Dept --</option>
                            {departments.map((d) => (
                              <option key={d.id} value={d.id}>{d.name_fr}</option>
                            ))}
                          </select>
                        </div>

                        {/* Catégorie */}
                        <div className="md:col-span-2">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[11px] font-bold text-gray-600">Catégorie</label>
                            <button type="button" onClick={() => setShowNewCatModal(true)} className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer">
                              + Créer
                            </button>
                          </div>
                          <select
                            value={item.categoryId}
                            onChange={(e) => {
                              handleItemChange(index, "categoryId", e.target.value);
                              handleItemChange(index, "productId", "");
                            }}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer"
                          >
                            <option value="">-- Cat --</option>
                            {filteredCats.map((c) => (
                              <option key={c.id} value={c.id}>{c.name_fr}</option>
                            ))}
                          </select>
                        </div>

                        {/* Produit */}
                        <div className="md:col-span-3">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[11px] font-bold text-gray-600">Produit *</label>
                            <button type="button" onClick={() => setShowNewProductModal(true)} className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer">
                              + Créer
                            </button>
                          </div>
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                            required
                          >
                            <option value="">-- Choisir Produit --</option>
                            {filteredProds.map((p) => (
                              <option key={p.id} value={p.id}>{p.name_fr} (Stock: {p.stock ?? 0})</option>
                            ))}
                          </select>
                          {selectedProductObj && (
                            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                              Dernier prix : {selectedProductObj.lastPurchasePrice ?? 0} MAD
                            </div>
                          )}
                        </div>

                        {/* Quantité */}
                        <div className="md:col-span-1">
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Qté *</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-center"
                            required
                          />
                        </div>

                        {/* Prix Unitaire */}
                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Prix Unitaire *</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => handleItemChange(index, "unitCost", Number(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-emerald-700"
                            required
                          />
                        </div>

                        {/* Total & Supprimer */}
                        <div className="md:col-span-2 flex items-center justify-between gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">Total</label>
                            <span className="text-xs font-extrabold text-emerald-800">{item.totalCost} MAD</span>
                          </div>
                          {purchaseItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition cursor-pointer"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewPurchaseModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer shadow-sm"
                >
                  Valider l'achat global
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOUS-MODAL : CRÉER DÉPARTEMENT */}
      {showNewDeptModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 text-base border-b pb-3">Nouveau Département</h3>
            <form onSubmit={handleAddDepartment} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nom (Français) *</label>
                  <input type="text" value={newDeptNameFr} onChange={(e) => setNewDeptNameFr(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nom (Arabe)</label>
                  <input type="text" value={newDeptNameAr} onChange={(e) => setNewDeptNameAr(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm text-right" dir="rtl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description (Français)</label>
                  <textarea rows={2} value={newDeptDescFr} onChange={(e) => setNewDeptDescFr(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description (Arabe)</label>
                  <textarea rows={2} value={newDeptDescAr} onChange={(e) => setNewDeptDescAr(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm text-right" dir="rtl" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">URL de l'image</label>
                <input type="text" value={newDeptImage} onChange={(e) => setNewDeptImage(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input type="checkbox" checked={newDeptIsActive} onChange={(e) => setNewDeptIsActive(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  Département Actif
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowNewDeptModal(false)} className="px-3 py-1.5 text-xs font-bold text-gray-600">Annuler</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-xl cursor-pointer">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOUS-MODAL : CRÉER CATÉGORIE */}
      {showNewCatModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 text-base border-b pb-3">Nouvelle Catégorie</h3>
            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Département rattaché *</label>
                <select value={newCatDeptId} onChange={(e) => setNewCatDeptId(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm cursor-pointer" required>
                  <option value="">-- Choisir un département --</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name_fr}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nom (Français) *</label>
                  <input type="text" value={newCatNameFr} onChange={(e) => setNewCatNameFr(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nom (Arabe)</label>
                  <input type="text" value={newCatNameAr} onChange={(e) => setNewCatNameAr(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm text-right" dir="rtl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description (Français)</label>
                  <textarea rows={2} value={newCatDescFr} onChange={(e) => setNewCatDescFr(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description (Arabe)</label>
                  <textarea rows={2} value={newCatDescAr} onChange={(e) => setNewCatDescAr(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm text-right" dir="rtl" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">URL de l'image</label>
                <input type="text" value={newCatImage} onChange={(e) => setNewCatImage(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input type="checkbox" checked={newCatIsActive} onChange={(e) => setNewCatIsActive(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  Catégorie Active
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowNewCatModal(false)} className="px-3 py-1.5 text-xs font-bold text-gray-600">Annuler</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-xl cursor-pointer">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOUS-MODAL : CRÉER PRODUIT */}
      {showNewProductModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 text-base border-b pb-3">Nouveau Produit</h3>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Département</label>
                  <select value={newProdDeptId} onChange={(e) => setNewProdDeptId(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm cursor-pointer">
                    <option value="">-- Choisir --</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name_fr}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Catégorie *</label>
                  <select value={newProdCatId} onChange={(e) => setNewProdCatId(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm cursor-pointer" required>
                    <option value="">-- Choisir --</option>
                    {categories.filter((c: any) => {
                      if (!newProdDeptId) return true;
                      const dId = c.departmentId || c.department?.id || c.department_id;
                      return String(dId) === String(newProdDeptId);
                    }).map((c) => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nom FR *</label>
                  <input type="text" value={newProdNameFr} onChange={(e) => setNewProdNameFr(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nom AR</label>
                  <input type="text" value={newProdNameAr} onChange={(e) => setNewProdNameAr(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm text-right" dir="rtl" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Prix vente (MAD) *</label>
                  <input type="number" step="0.01" value={newProdPrice} onChange={(e) => setNewProdPrice(Number(e.target.value))} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Ancien prix</label>
                  <input type="number" step="0.01" value={newProdOldPrice} onChange={(e) => setNewProdOldPrice(Number(e.target.value))} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Stock initial</label>
                  <input type="number" value={newProdStock} onChange={(e) => setNewProdStock(Number(e.target.value))} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unité</label>
                  <select value={newProdUnit} onChange={(e) => setNewProdUnit(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm">
                    <option value="Pièce">Pièce</option>
                    <option value="Pot">Pot</option>
                    <option value="Bouteille">Bouteille</option>
                    <option value="Kg">Kg</option>
                    <option value="Sachet">Sachet</option>
                    <option value="Lot">Lot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">SKU / Code</label>
                  <input type="text" value={newProdSku} onChange={(e) => setNewProdSku(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">URL Image</label>
                <input type="text" value={newProdImage} onChange={(e) => setNewProdImage(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" placeholder="https://..." />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input type="checkbox" checked={newProdIsActive} onChange={(e) => setNewProdIsActive(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  Actif
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input type="checkbox" checked={newProdIsFeatured} onChange={(e) => setNewProdIsFeatured(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  En vedette
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowNewProductModal(false)} className="px-3 py-1.5 text-xs font-bold text-gray-600">Annuler</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-xl cursor-pointer">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOUS-MODAL : CRÉER FOURNISSEUR */}
      {showNewSupplierModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 text-base border-b pb-3">Nouveau Fournisseur</h3>
            <form onSubmit={handleAddSupplier} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nom du contact *</label>
                  <input type="text" value={newSuppName} onChange={(e) => setNewSuppName(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Entreprise / Coopérative</label>
                  <input type="text" value={newSuppCompanyName} onChange={(e) => setNewSuppCompanyName(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                  <input type="email" value={newSuppEmail} onChange={(e) => setNewSuppEmail(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Téléphone</label>
                  <input type="text" value={newSuppPhone} onChange={(e) => setNewSuppPhone(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" placeholder="+212 6..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Adresse complète</label>
                <input type="text" value={newSuppAddress} onChange={(e) => setNewSuppAddress(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notes / Remarques</label>
                <textarea rows={2} value={newSuppNotes} onChange={(e) => setNewSuppNotes(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowNewSupplierModal(false)} className="px-3 py-1.5 text-xs font-bold text-gray-600">Annuler</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-xl cursor-pointer">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLEAU HISTORIQUE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <FiFileText className="text-emerald-600" /> Historique des Achats & Approvisionnements
          </h2>
        </div>

        {purchases.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">Aucun achat enregistré pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 px-6 font-bold">Produit</th>
                  <th className="py-3 px-6 font-bold">Fournisseur</th>
                  <th className="py-3 px-6 font-bold">Quantité</th>
                  <th className="py-3 px-6 font-bold">Coût Total</th>
                  <th className="py-3 px-6 font-bold">Statut</th>
                  <th className="py-3 px-6 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {purchases.map((pur) => (
                  <tr key={pur.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6 font-semibold text-gray-900">{pur.productName}</td>
                    <td className="py-4 px-6">{pur.supplierName}</td>
                    <td className="py-4 px-6 font-bold">+{pur.quantity}</td>
                    <td className="py-4 px-6 font-extrabold text-emerald-600">{pur.totalCost} MAD</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                        {pur.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {pur.createdAt ? new Date(pur.createdAt).toLocaleDateString("fr-FR") : "Récemment"}
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