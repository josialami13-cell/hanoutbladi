"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FiMessageSquare, FiCheck, FiX, FiStar, FiShoppingBag } from "react-icons/fi";

interface Review { id: string; rating: number; comment?: string | null; createdAt: string; client: { name: string; phone: string }; product: { name_fr: string; images: string[] }; order: { orderNumber: string; status: string } }
export default function AdminReviewsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch(`/api/admin/reviews?status=${filter}`); if (!res.ok) throw new Error("Accès refusé ou chargement impossible."); setReviews(await res.json()); }
    catch (error: any) { toast.error(error.message || "Erreur de chargement."); }
    finally { setLoading(false); }
  }, [filter]);
  useEffect(() => { if (status === "unauthenticated") router.replace("/admin/login"); }, [status, router]);
  useEffect(() => { if (status === "authenticated") void load(); }, [status, load]);
  const moderate = async (review: Review, nextStatus: "APPROVED" | "REJECTED") => {
    const res = await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: review.id, status: nextStatus }) });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || "Action impossible.");
    toast.success(nextStatus === "APPROVED" ? "Avis publié et note produit recalculée." : "Avis rejeté.");
    await load();
  };
  return <div className="mx-auto max-w-5xl space-y-6 pb-12">
    <header className="flex items-center gap-3"><span className="rounded-2xl bg-amber-50 p-3 text-amber-700"><FiMessageSquare size={22} /></span><div><h1 className="text-2xl font-bold text-stone-900">Avis clients</h1><p className="text-sm text-stone-500">Les avis ne sont visibles dans la boutique qu’après validation.</p></div></header>
    <div className="flex gap-2">{[["PENDING","À vérifier"],["APPROVED","Publiés"],["REJECTED","Refusés"]].map(([value,label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-xs font-bold ${filter === value ? "bg-emerald-700 text-white" : "bg-white text-stone-600 border border-stone-200"}`}>{label}</button>)}</div>
    {loading ? <div className="rounded-2xl bg-white p-12 text-center text-stone-500">Chargement…</div> : reviews.length === 0 ? <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center text-sm text-stone-500">Aucun avis dans cette catégorie.</div> : <div className="space-y-4">{reviews.map((review) => <article key={review.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row"><div className="min-w-0 flex-1"><div className="flex items-center gap-1 text-amber-500">{Array.from({ length: 5 }, (_, i) => <FiStar key={i} fill={i < review.rating ? "currentColor" : "none"} />)}<span className="ml-2 text-xs font-bold text-stone-700">{review.rating}/5</span></div><p className="mt-3 whitespace-pre-wrap text-sm text-stone-800">{review.comment || "(Avis sans commentaire)"}</p><p className="mt-3 text-xs text-stone-500">{review.client.name} · {review.client.phone} · {new Date(review.createdAt).toLocaleDateString("fr-FR")}</p><p className="mt-1 flex items-center gap-1 text-xs text-emerald-700"><FiShoppingBag /> {review.product.name_fr} · commande #{review.order.orderNumber} ({review.order.status})</p></div>{filter === "PENDING" && <div className="flex shrink-0 gap-2 sm:flex-col"><button onClick={() => void moderate(review, "APPROVED")} className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white"><FiCheck /> Publier</button><button onClick={() => void moderate(review, "REJECTED")} className="inline-flex items-center justify-center gap-1 rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700"><FiX /> Refuser</button></div>}</div></article>)}</div>}
  </div>;
}
