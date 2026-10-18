// =============================================================
// PAGE SUCCÈS - Confirmation de commande & Purge Panier
// =============================================================

"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { 
  FiCheckCircle, 
  FiShoppingBag, 
  FiArrowLeft, 
  FiMessageCircle, 
  FiUserPlus, 
  FiLock 
} from "react-icons/fi";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || searchParams.get("ref");
  const { clearCart } = useCartStore();

  // Vidage automatique du panier une fois la commande validée
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <section className="py-16 min-h-[75vh] flex items-center justify-center bg-[#F8FAF6] px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-xs text-center space-y-6">
        
        {/* Icône de succès */}
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-inner">
          <FiCheckCircle />
        </div>

        {/* Titre et description */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-stone-900">
            Commande confirmée !
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            Merci pour votre confiance. Votre commande a bien été enregistrée et transmise à notre équipe. Nous vous contacterons bientôt pour confirmer la livraison.
          </p>
        </div>

        {/* Numéro de commande unique */}
        {orderNumber && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-1">
            <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Référence de commande</p>
            <p className="text-lg font-extrabold text-emerald-700 tracking-wide font-mono">{orderNumber}</p>
          </div>
        )}

        {/* ENCART D'INVITATION À CRÉER SON ESPACE CLIENT */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-left space-y-3">
          <div className="flex items-center gap-2.5 text-stone-900 font-extrabold text-xs">
            <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
              <FiUserPlus size={14} />
            </div>
            <span>Suivez vos commandes en un clin d'œil</span>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            Créez votre mot de passe dès maintenant pour retrouver l'historique de cette commande et cumuler vos points de fidélité dans votre espace personnel.
          </p>
          
          <Link
            href={`/shop/auth?order=${orderNumber || ""}`}
            className="w-full bg-[#3B4D3C] hover:bg-[#2d3c2e] text-white font-extrabold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-sm cursor-pointer text-center"
          >
            <FiLock size={14} /> Sécuriser mon compte & Suivre ma commande
          </Link>
        </div>

        {/* Actions et Support */}
        <div className="space-y-3 pt-1">
          
          {/* Bouton WhatsApp */}
          <a
            href={`https://wa.me/212664903009?text=${encodeURIComponent(`Bonjour, je souhaite avoir des informations concernant ma commande ${orderNumber || ""}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-sm cursor-pointer"
          >
            <FiMessageCircle size={16} /> Contacter le support WhatsApp
          </a>

          {/* Boutons de retour */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link 
              href="/shop" 
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-3 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs cursor-pointer"
            >
              <FiShoppingBag size={14} /> Boutique
            </Link>
            <Link 
              href="/" 
              className="border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold py-3 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs cursor-pointer"
            >
              <FiArrowLeft size={14} /> Accueil
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-stone-400 text-xs font-medium">Chargement de la confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}