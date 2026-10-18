"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiAward, FiSave, FiShoppingBag, FiTrash2 } from "react-icons/fi";

interface ClientRecord {
  id: string; name: string; phone: string; email?: string | null; address?: string | null; city?: string | null;
  loyaltyPoints: number; createdAt: string; orders: Array<{ id: string; orderNumber: string; status: string; totalAmount: number; createdAt: string; items: Array<{ quantity: number; product: { name_fr: string } }> }>;
  _count: { reviews: number };
}

export default function AdminClientDetailPage() {
  const { status } = useSession();
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");
  const [client, setClient] = useState<ClientRecord | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", loyaltyPoints: "0" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const response = await fetch(`/api/admin/clients/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Client introuvable.");
      setClient(data);
      setForm({ name: data.name || "", phone: data.phone || "", email: data.email || "", address: data.address || "", city: data.city || "", loyaltyPoints: String(data.loyaltyPoints || 0) });
    } catch (error: any) {
      toast.error(error.message || "Impossible de charger le client.");
      router.replace("/admin/clients");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (status === "unauthenticated") router.replace("/admin/login"); }, [status, router]);
  useEffect(() => { if (status === "authenticated" && id) void load(); }, [status, id]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/clients/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, loyaltyPoints: Number(form.loyaltyPoints) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur d’enregistrement.");
      toast.success("Fiche client mise à jour.");
      await load();
    } catch (error: any) { toast.error(error.message || "Erreur serveur."); }
    finally { setSaving(false); }
  };

  const deleteAccount = async () => {
    if (!client) return;
    const confirmed = window.confirm(
      `Supprimer le compte de ${client.name} ?\n\n` +
        "Les commandes historiques seront conservées, mais détachées du compte client. Les avis associés seront supprimés. Les coordonnées déjà enregistrées dans les commandes resteront dans leur historique.",
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de supprimer ce compte.");
      toast.success("Compte client supprimé. Les commandes historiques ont été conservées.");
      router.replace("/admin/clients");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression du compte.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-stone-500">Chargement de la fiche client…</div>;
  if (!client) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/clients" aria-label="Retour à la liste des clients" className="rounded-xl border border-stone-200 bg-white p-2.5 text-stone-600"><FiArrowLeft /></Link>
          <div><h1 className="text-2xl font-bold text-stone-900">Fiche client</h1><p className="text-sm text-stone-500">Inscrit le {new Date(client.createdAt).toLocaleDateString("fr-FR")}</p></div>
        </div>
        <button
          type="button"
          onClick={() => void deleteAccount()}
          disabled={deleting || saving}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-wait disabled:opacity-50 sm:self-auto"
        >
          <FiTrash2 />{deleting ? "Suppression…" : "Supprimer le compte"}
        </button>
      </div>
      <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-bold text-stone-900">Coordonnées</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {([ ["name","Nom complet"], ["phone","Téléphone"], ["email","Email"], ["city","Ville"] ] as const).map(([key,label]) => (
              <label key={key} className="text-xs font-semibold text-stone-600">{label}<input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 w-full rounded-xl border border-stone-200 p-3 text-sm" /></label>
            ))}
            <label className="text-xs font-semibold text-stone-600 sm:col-span-2">Adresse<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 w-full rounded-xl border border-stone-200 p-3 text-sm" /></label>
          </div>
        </section>
        <section className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="flex items-center gap-2 font-bold text-amber-950"><FiAward /> Fidélité</h2>
          <label className="block text-xs font-semibold text-amber-900">Solde total de points<input type="number" min="0" step="1" value={form.loyaltyPoints} onChange={(e) => setForm({ ...form, loyaltyPoints: e.target.value })} className="mt-1 w-full rounded-xl border border-amber-200 bg-white p-3 text-lg font-bold" /></label>
          <p className="text-xs text-amber-900">Valeur au barème actuel : {(Number(form.loyaltyPoints || 0) / 50).toFixed(2)} DH. 500 points = 10 DH ; échange limité à 20 % du sous-total.</p>
          <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white disabled:opacity-60"><FiSave />{saving ? "Enregistrement…" : "Enregistrer la fiche"}</button>
        </section>
      </form>
      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-bold text-stone-900"><FiShoppingBag /> Commandes</h2><span className="text-xs text-stone-500">{client.orders.length} commande(s) · {client._count.reviews} avis envoyés</span></div>
        {client.orders.length === 0 ? <p className="text-sm text-stone-500">Aucune commande enregistrée.</p> : <div className="divide-y divide-stone-100">{client.orders.map((order) => <div key={order.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-stone-900">#{order.orderNumber} <span className="ml-2 rounded-full bg-stone-100 px-2 py-1 text-[10px]">{order.status}</span></p><p className="mt-1 text-xs text-stone-500">{order.items.map((item) => `${item.product.name_fr} × ${item.quantity}`).join(" · ")}</p></div><div className="text-right"><p className="font-bold text-emerald-800">{order.totalAmount.toFixed(2)} DH</p><p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</p></div></div>)}</div>}
      </section>
    </div>
  );
}
