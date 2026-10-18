"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FiGift, FiPlus, FiSave, FiTrash2, FiEdit2, FiX } from "react-icons/fi";

interface Product { id: string; name_fr: string; price: number; stock: number; images: string[] }
interface Item { productId: string; quantity: number }
interface Bundle { id: string; name_fr: string; name_ar?: string | null; description_fr?: string | null; discountPercent: number; isActive: boolean; items: Array<{ productId: string; quantity: number; product: Product }> }
const emptyForm = { name_fr: "", name_ar: "", description_fr: "", discountPercent: "10", isActive: true };

export default function AdminBundlesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState<Item[]>([{ productId: "", quantity: 1 }]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [bundleRes, productRes] = await Promise.all([fetch("/api/admin/bundles"), fetch("/api/admin/products?active=all")]);
      if (!bundleRes.ok || !productRes.ok) throw new Error("Chargement des données impossible.");
      const [bundleData, productData] = await Promise.all([bundleRes.json(), productRes.json()]);
      setBundles(Array.isArray(bundleData) ? bundleData : []);
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (error: any) { toast.error(error.message || "Erreur de chargement."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (status === "unauthenticated") router.replace("/admin/login"); }, [status, router]);
  useEffect(() => { if (status === "authenticated") void load(); }, [status, load]);

  const reset = () => { setForm(emptyForm); setItems([{ productId: "", quantity: 1 }]); setEditingId(null); };
  const editBundle = (bundle: Bundle) => {
    setEditingId(bundle.id);
    setForm({ name_fr: bundle.name_fr, name_ar: bundle.name_ar || "", description_fr: bundle.description_fr || "", discountPercent: String(bundle.discountPercent), isActive: bundle.isActive });
    setItems(bundle.items.map((item) => ({ productId: item.productId, quantity: item.quantity })));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const validItems = items.filter((item) => item.productId && Number(item.quantity) > 0);
    if (!form.name_fr.trim() || validItems.length === 0) return toast.error("Ajoutez un nom et au moins un produit.");
    setSaving(true);
    try {
      const response = await fetch(editingId ? `/api/admin/bundles/${editingId}` : "/api/admin/bundles", {
        method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, discountPercent: Number(form.discountPercent), items: validItems }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Enregistrement impossible.");
      toast.success(editingId ? "Pack modifié." : "Pack créé.");
      reset(); await load();
    } catch (error: any) { toast.error(error.message || "Erreur serveur."); }
    finally { setSaving(false); }
  };

  const remove = async (bundle: Bundle) => {
    if (!window.confirm(`Supprimer le pack « ${bundle.name_fr} » ?`)) return;
    const response = await fetch(`/api/admin/bundles/${bundle.id}`, { method: "DELETE" });
    if (!response.ok) return toast.error("Suppression impossible.");
    toast.success("Pack supprimé."); await load();
  };

  if (loading) return <div className="p-12 text-center text-stone-500">Chargement des packs…</div>;
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <header className="flex items-center gap-3"><span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><FiGift size={22} /></span><div><h1 className="text-2xl font-bold text-stone-900">Packs découverte & cadeaux</h1><p className="text-sm text-stone-500">Composez des lots de produits avec une remise visible dans la boutique.</p></div></header>
      <form onSubmit={save} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><h2 className="font-bold text-stone-900">{editingId ? "Modifier le pack" : "Créer un pack"}</h2>{editingId && <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-xs text-stone-500"><FiX /> Annuler</button>}</div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs font-semibold text-stone-600">Nom du pack (FR) *<input required value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} className="mt-1 w-full rounded-xl border p-3 text-sm" /></label>
          <label className="text-xs font-semibold text-stone-600">Nom du pack (AR)<input dir="rtl" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className="mt-1 w-full rounded-xl border p-3 text-sm" /></label>
          <label className="text-xs font-semibold text-stone-600">Description<textarea rows={2} value={form.description_fr} onChange={(e) => setForm({ ...form, description_fr: e.target.value })} className="mt-1 w-full rounded-xl border p-3 text-sm" /></label>
          <label className="text-xs font-semibold text-stone-600">Remise (%)<input type="number" min="1" max="100" step="0.5" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} className="mt-1 w-full rounded-xl border p-3 text-sm" /></label>
        </div>
        <div className="space-y-2"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">Produits du pack</h3><button type="button" onClick={() => setItems([...items, { productId: "", quantity: 1 }])} className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-3 py-2 text-xs font-bold"><FiPlus /> Ajouter un produit</button></div>
          {items.map((item, index) => <div key={index} className="grid grid-cols-[1fr_100px_40px] gap-2"><select value={item.productId} onChange={(e) => setItems(items.map((entry, i) => i === index ? { ...entry, productId: e.target.value } : entry))} className="rounded-xl border p-2.5 text-sm"><option value="">Choisir un produit…</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name_fr} · {product.price} DH</option>)}</select><input type="number" min="1" step="1" value={item.quantity} onChange={(e) => setItems(items.map((entry, i) => i === index ? { ...entry, quantity: Number(e.target.value) } : entry))} className="rounded-xl border p-2.5 text-sm" aria-label="Quantité" /><button type="button" onClick={() => setItems(items.length > 1 ? items.filter((_, i) => i !== index) : [{ productId: "", quantity: 1 }])} className="rounded-xl border text-rose-600" aria-label="Retirer le produit"><FiTrash2 className="mx-auto" /></button></div>)}
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Afficher ce pack dans la boutique</label>
        <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><FiSave />{saving ? "Enregistrement…" : editingId ? "Enregistrer les changements" : "Créer le pack"}</button>
      </form>
      <section className="space-y-3"><h2 className="font-bold text-stone-900">Packs enregistrés ({bundles.length})</h2>{bundles.length === 0 ? <p className="rounded-2xl bg-white p-8 text-center text-sm text-stone-500">Aucun pack pour le moment. Créez votre première offre ci-dessus.</p> : <div className="grid gap-4 md:grid-cols-2">{bundles.map((bundle) => <article key={bundle.id} className="rounded-2xl border border-stone-200 bg-white p-5"><div className="flex justify-between gap-3"><div><h3 className="font-bold text-stone-900">{bundle.name_fr}</h3><p className="mt-1 text-xs text-stone-500">{bundle.items.map((item) => `${item.product.name_fr} × ${item.quantity}`).join(" · ")}</p></div><span className={`h-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${bundle.isActive ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>{bundle.isActive ? "En ligne" : "Masqué"}</span></div><p className="mt-3 text-sm font-extrabold text-amber-700">-{bundle.discountPercent}%</p><div className="mt-4 flex gap-2 border-t pt-3"><button type="button" onClick={() => editBundle(bundle)} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"><FiEdit2 /> Modifier</button><button type="button" onClick={() => void remove(bundle)} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"><FiTrash2 /> Supprimer</button></div></article>)}</div>}</section>
    </div>
  );
}
