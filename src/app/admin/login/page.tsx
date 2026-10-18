"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { FiLock, FiUser, FiShield, FiEye, FiEyeOff, FiRefreshCw } from "react-icons/fi";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        identifier: identifier.trim(),
        password: password.trim(),
        loginType: "admin", // <--- Cible explicitement la table User (Personnel / Admin)
        redirect: false,
      });

      if (result?.error) {
        toast.error("Identifiant ou mot de passe incorrect");
      } else {
        toast.success("Connexion réussie !");
        window.location.href = callbackUrl;
      }
    } catch (error) {
      toast.error("Erreur lors de la tentative de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
      {/* En-tête du formulaire */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <FiShield size={28} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Hanout<span className="text-emerald-600">Bladi</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1 font-medium">
          Panneau d'administration & Gestion
        </p>
      </div>

      {/* Formulaire de connexion */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Email ou N° de Téléphone
          </label>
          <div className="relative">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              placeholder="admin@hanoutbladi.ma ou 0661234567"
              required
            />
            <FiUser className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              placeholder="••••••••"
              required
            />
            <FiLock className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none transition cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <FiRefreshCw className="animate-spin" size={16} />
              Vérification en cours...
            </>
          ) : (
            "Se connecter"
          )}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Suspense fallback={<div className="text-white text-sm">Chargement du formulaire...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}