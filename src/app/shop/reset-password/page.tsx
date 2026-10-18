
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { FiLock, FiCheckCircle, FiArrowLeft, FiKey } from "react-icons/fi";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      return toast.error("Jeton de réinitialisation manquant ou invalide.");
    }
    if (password.length < 6) {
      return toast.error("Le mot de passe doit contenir au moins 6 caractères.");
    }
    if (password !== confirmPassword) {
      return toast.error("Les mots de passe ne correspondent pas.");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success("Mot de passe mis à jour avec succès !");
        setTimeout(() => {
          router.push("/shop/login");
        }, 2500);
      } else {
        toast.error(data.error || "Une erreur est survenue.");
      }
    } catch {
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <section className="py-16 min-h-[75vh] flex items-center justify-center bg-[#FAF9F5] px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-200 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
            <FiLock />
          </div>
          <h1 className="text-xl font-serif font-extrabold text-stone-900">Lien invalide ou expiré</h1>
          <p className="text-xs text-stone-500 leading-relaxed">
            Ce lien de réinitialisation est incomplet, incorrect ou a expiré. Veuillez refaire une demande de réinitialisation.
          </p>
          <div className="pt-2">
            <Link
              href="/shop/forgot-password"
              className="inline-block bg-[#2C3E2D] hover:bg-[#1f2b20] text-white px-6 py-3 rounded-full text-xs font-bold transition uppercase tracking-wider shadow-md"
            >
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 min-h-[75vh] flex items-center justify-center bg-[#FAF9F5] px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
            <FiKey />
          </div>
          <h1 className="text-xl font-serif font-extrabold text-stone-900">Nouveau mot de passe</h1>
          <p className="text-stone-500 text-xs">
            Veuillez définir votre nouveau mot de passe sécurisé pour votre compte client.
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center space-y-3">
            <FiCheckCircle size={36} className="mx-auto text-emerald-600" />
            <p className="text-sm font-bold">Mot de passe réinitialisé !</p>
            <p className="text-xs text-emerald-700">
              Votre mot de passe a été mis à jour. Redirection vers la page de connexion...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nouveau mot de passe *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-stone-400">
                  <FiLock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FAF9F5] border border-stone-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#2C3E2D] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Confirmer le mot de passe *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-stone-400">
                  <FiLock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FAF9F5] border border-stone-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#2C3E2D] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2C3E2D] hover:bg-[#1f2b20] text-white font-bold py-3.5 rounded-full text-xs transition cursor-pointer shadow-md disabled:opacity-50 uppercase tracking-wider"
            >
              {loading ? "Enregistrement..." : "Enregistrer le mot de passe"}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            href="/shop/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition"
          >
            <FiArrowLeft size={14} /> Retour à la connexion
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-stone-400 font-medium">Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
