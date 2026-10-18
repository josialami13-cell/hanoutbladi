"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FiArrowLeft, FiAward, FiCheckCircle, FiShoppingBag, FiStar } from "react-icons/fi";
import { useCartStore } from "@/store/cart";
import { useLanguage } from "@/context/LanguageContext";
import Price from "@/components/Price";

interface Product { id: string; name_fr: string; name_ar?: string | null; description_fr?: string | null; description_ar?: string | null; price: number; stock: number; loyaltyPoints: number; rating: number; reviewsCount: number; images: string[]; category?: { name_fr: string; name_ar?: string | null } }
interface ProductReview { id: string; rating: number; comment?: string | null; createdAt: string; author: string }
interface EligibleOrder { id: string; orderNumber: string }

export default function ProductDetailPage() {
  const params = useParams();
  const slug = String(params?.slug || "");
  const { data: session } = useSession();
  const { language } = useLanguage() as { language: string };
  const isAr = language === "ar";
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [eligibleOrders, setEligibleOrders] = useState<EligibleOrder[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [orderId, setOrderId] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async (productId: string) => {
    const response = await fetch(`/api/products/${productId}/reviews`);
    const data = await response.json();
    if (response.ok) {
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      const orders = Array.isArray(data.eligibleOrders) ? data.eligibleOrders : [];
      setEligibleOrders(orders);
      setOrderId((current) => current || orders[0]?.id || "");
    }
  }, []);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/products/${encodeURIComponent(slug)}`).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Produit introuvable.");
      setProduct(data);
      await loadReviews(data.id);
    }).catch((error: any) => toast.error(error.message || "Impossible de charger le produit.")).finally(() => setLoading(false));
  }, [slug, loadReviews]);

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!product || !orderId) return;
    setSending(true);
    try {
      const response = await fetch(`/api/products/${product.id}/reviews`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, rating, comment }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible d’envoyer votre avis.");
      toast.success(data.message || "Avis envoyé pour validation.");
      setComment("");
      setEligibleOrders((orders) => orders.filter((order) => order.id !== orderId));
      setOrderId("");
    } catch (error: any) { toast.error(error.message || "Erreur serveur."); }
    finally { setSending(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#faf9f5] p-12 text-center text-stone-500">Chargement du produit…</div>;
  if (!product) return <div className="min-h-screen bg-[#faf9f5] p-12 text-center"><p>Produit introuvable.</p><Link href="/shop" className="mt-4 inline-block text-emerald-800 underline">Retour à la boutique</Link></div>;

  const title = isAr && product.name_ar ? product.name_ar : product.name_fr;
  const description = isAr && product.description_ar ? product.description_ar : product.description_fr;
  const image = product.images?.[0] || "/images/huile1l.jpg";
  return <main dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#faf9f5] px-4 py-8 text-stone-800 sm:px-6">
    <div className="mx-auto max-w-6xl space-y-8">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-emerald-800"><FiArrowLeft /> {isAr ? "العودة إلى المتجر" : "Retour à la boutique"}</Link>
      <section className="grid gap-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-[#f4f2eb] p-5"><img src={image} alt={title} className="max-h-[420px] w-full object-contain" /></div>
        <div className="flex flex-col justify-center">
          {product.category && <p className="text-xs font-bold uppercase tracking-wider text-amber-700">{isAr && product.category.name_ar ? product.category.name_ar : product.category.name_fr}</p>}
          <h1 className="mt-2 font-serif text-3xl font-bold text-stone-900">{title}</h1>
          <p className="mt-3 text-sm leading-7 text-stone-600">{description || (isAr ? "منتج من اختيارنا." : "Un produit sélectionné par Hanout Bladi.")}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm"><span className="font-extrabold text-[#2c3e2d]"><Price amountInMAD={product.price} /></span><span className="flex items-center gap-1 text-amber-600"><FiStar fill="currentColor" /> {product.rating ? product.rating.toFixed(1) : "—"} · {product.reviewsCount} avis</span></div>
          {product.loyaltyPoints > 0 && <p className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"><FiAward /> +{product.loyaltyPoints} points fidélité par unité</p>}
          <p className="mt-3 text-xs text-stone-500">{product.stock > 0 ? `${product.stock} disponible(s)` : "En rupture de stock"}</p>
          <button disabled={product.stock <= 0} onClick={() => { addItem({ id: product.id, name_fr: product.name_fr, name_ar: product.name_ar || undefined, price: product.price, image, stock: product.stock }); toast.success("Produit ajouté au panier !"); }} className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-[#2c3e2d] px-5 py-3 text-sm font-bold text-white disabled:opacity-40"><FiShoppingBag /> {isAr ? "أضف إلى السلة" : "Ajouter au panier"}</button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[1fr_.85fr]">
        <div className="rounded-3xl border border-stone-200 bg-white p-6"><h2 className="font-serif text-2xl font-bold text-stone-900">Avis clients vérifiés</h2><p className="mt-1 text-xs text-stone-500">Seuls les avis d’acheteurs ayant reçu ce produit sont affichés.</p>
          {reviews.length === 0 ? <p className="mt-6 rounded-xl bg-stone-50 p-5 text-sm text-stone-500">Pas encore d’avis publié pour ce produit.</p> : <div className="mt-5 space-y-4">{reviews.map((review) => <article key={review.id} className="border-b border-stone-100 pb-4 last:border-0"><div className="flex items-center gap-1 text-amber-500">{Array.from({ length: 5 }, (_, i) => <FiStar key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />)}<span className="ml-2 text-xs font-semibold text-stone-700">{review.author}</span></div>{review.comment && <p className="mt-2 text-sm leading-6 text-stone-700">{review.comment}</p>}<time className="mt-2 block text-[10px] text-stone-400">{new Date(review.createdAt).toLocaleDateString(isAr ? "ar-MA" : "fr-FR")}</time></article>)}</div>}
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-6"><h2 className="font-serif text-xl font-bold text-stone-900">Donner mon avis</h2>
          {eligibleOrders.length > 0 ? <form onSubmit={submitReview} className="mt-4 space-y-4"><label className="block text-xs font-semibold text-stone-600">Commande livrée<select value={orderId} onChange={(event) => setOrderId(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 p-3 text-sm">{eligibleOrders.map((order) => <option key={order.id} value={order.id}>#{order.orderNumber}</option>)}</select></label><label className="block text-xs font-semibold text-stone-600">Votre note<select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-stone-200 p-3 text-sm">{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} / 5 étoiles</option>)}</select></label><label className="block text-xs font-semibold text-stone-600">Commentaire<textarea maxLength={1500} rows={4} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Votre expérience avec ce produit…" className="mt-1 w-full rounded-xl border border-stone-200 p-3 text-sm" /></label><button disabled={sending || !orderId} className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{sending ? "Envoi…" : "Envoyer pour validation"}</button><p className="flex items-center gap-1 text-[10px] text-stone-500"><FiCheckCircle /> Votre avis sera visible après vérification par l’équipe.</p></form> : session?.user ? <p className="mt-4 rounded-xl bg-stone-50 p-4 text-sm text-stone-500">Vous pourrez laisser un avis après réception d’une commande contenant ce produit.</p> : <div className="mt-4 rounded-xl bg-stone-50 p-4 text-sm text-stone-600">Connectez-vous pour déposer un avis après livraison. <Link href="/client/login" className="font-bold text-emerald-800 underline">Connexion client</Link></div>}
        </div>
      </section>
    </div>
  </main>;
}
