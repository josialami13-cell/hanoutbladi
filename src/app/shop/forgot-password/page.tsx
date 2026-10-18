"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiPhone, FiArrowLeft, FiLock, FiMessageSquare } from "react-icons/fi";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        toast.success("Lien WhatsApp généré avec succès !");
        if (data.whatsappLink) setWhatsappLink(data.whatsappLink);
      } else {
        toast.error(data.error || "Une erreur est survenue");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 min-h-[75vh] flex items-center justify-center bg-[#FAF9F5] px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
            <FiLock />
          </div>
          <h1 className="text-xl font-serif font-extrabold text-stone-900">Mot de passe oublié ?</h1>
          <p className="text-stone-500 text-xs">
            Entrez votre numéro de téléphone associé à votre compte client pour recevoir votre lien de réinitialisation par WhatsApp.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Numéro de téléphone</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-stone-400">
                  <FiPhone size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: +212 600000000"
                  className="w-full bg-[#FAF9F5] border border-stone-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#2C3E2D] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-full text-xs transition cursor-pointer shadow-md disabled:opacity-50 uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <FiMessageSquare size={16} />
              {loading ? "Génération..." : "Recevoir le lien sur WhatsApp"}
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs leading-relaxed">
              Demande enregistrée pour le numéro <strong>{phone}</strong>.
            </div>
            {whatsappLink && (
              <div className="space-y-3 pt-2">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-xs transition shadow-md text-center"
                >
                  Ouvrir WhatsApp pour envoyer le lien
                </a>
              </div>
            )}
          </div>
        )}

        <div className="text-center pt-2">
          <Link href="/shop/login" className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition">
            <FiArrowLeft size={14} /> Retour à la connexion
          </Link>
        </div>
      </div>
    </section>
  );
}
