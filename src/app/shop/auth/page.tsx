"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { FiPhone, FiLock, FiUser, FiArrowLeft } from "react-icons/fi";

export default function ClientAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanPhone = phone.trim().replace(/\s+/g, "");

    if (isLogin) {
      // Connexion avec le téléphone comme identifiant
      const res = await signIn("credentials", {
        redirect: false,
        identifier: cleanPhone,
        password,
      });

      if (res?.error) {
        toast.error("Numéro de téléphone ou mot de passe incorrect");
      } else {
        toast.success("Connexion réussie !");
        router.push("/shop/account");
        router.refresh();
      }
    } else {
      // Inscription d'un nouveau client
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone: cleanPhone, password }),
        });

        const data = await res.json();
        if (res.ok) {
          toast.success("Compte créé avec succès ! Connectez-vous.");
          setIsLogin(true);
        } else {
          toast.error(data.error || "Erreur lors de l'inscription");
        }
      } catch (err) {
        toast.error("Erreur serveur");
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-emerald-600 mb-6 transition"
      >
        <FiArrowLeft size={14} /> Retour à la boutique
      </Link>

      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-gray-900">
            {isLogin ? "Espace Client" : "Créer un compte"}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isLogin
              ? "Connectez-vous avec votre numéro de téléphone"
              : "Inscrivez-vous pour suivre vos commandes"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nom complet
              </label>
              <div className="relative flex items-center">
                <FiUser className="absolute left-3 text-gray-400" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Votre nom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Numéro de téléphone
            </label>
            <div className="relative flex items-center">
              <FiPhone className="absolute left-3 text-gray-400" size={16} />
              <input
                type="tel"
                required
                placeholder="06XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative flex items-center">
              <FiLock className="absolute left-3 text-gray-400" size={16} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? "Patientez..." : isLogin ? "Se connecter" : "S'inscrire"}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer"
          >
            {isLogin
              ? "Pas encore de compte ? S'inscrire"
              : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}