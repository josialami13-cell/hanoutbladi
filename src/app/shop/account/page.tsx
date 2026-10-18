"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FiUser,
  FiShoppingBag,
  FiPhone,
  FiMail,
  FiMapPin,
  FiLogOut,
  FiPackage,
  FiClock,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name_fr: string;
    slug: string;
    images?: string[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  address: string;
  city: string;
  createdAt: string;
  items: OrderItem[];
  delivery?: {
    status: string;
    shippingFee: number;
  } | null;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserOrders();
    }
  }, [status]);

  const fetchUserOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch("/api/user/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        toast.error("Impossible de charger vos commandes.");
      }
    } catch (err) {
      console.error("Erreur récupération commandes client:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "livré":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">
            <FiCheckCircle size={12} /> Livrée
          </span>
        );
      case "cancelled":
      case "annulée":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full">
            <FiXCircle size={12} /> Annulée
          </span>
        );
      case "processing":
      case "en cours":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            <FiPackage size={12} /> En préparation
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
            <FiClock size={12} /> En attente
          </span>
        );
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F8FAF6] py-16 text-center text-stone-500 font-bold text-sm">
        Chargement de votre compte...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#F8FAF6] py-16 px-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <FiUser size={32} />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Connexion requise</h2>
          <p className="text-xs text-stone-500">
            Connectez-vous pour accéder à votre profil et consulter vos commandes.
          </p>
          <Link
            href="/shop/auth"
            className="block w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-sm text-sm"
          >
            Se connecter / S'inscrire
          </Link>
        </div>
      </div>
    );
  }

  const user = session?.user as any;

  return (
    <div className="min-h-screen bg-[#F8FAF6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* En-tête Profil */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-600 text-white font-extrabold text-2xl rounded-2xl flex items-center justify-center shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                {user?.name || "Client HanoutBladi"}
              </h1>
              <p className="text-xs text-stone-500 flex items-center gap-2 mt-1">
                {user?.phone && <span className="flex items-center gap-1"><FiPhone /> {user.phone}</span>}
                {user?.email && <span className="flex items-center gap-1"><FiMail /> {user.email}</span>}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/shop" })}
            className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <FiLogOut /> Déconnexion
          </button>
        </div>

        {/* Historique des commandes */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
            <FiShoppingBag className="text-emerald-600" /> Mes Commandes ({orders.length})
          </h2>

          {loadingOrders ? (
            <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center text-xs text-stone-400">
              Chargement de vos commandes...
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-stone-200 text-center space-y-3">
              <FiPackage size={40} className="mx-auto text-stone-300" />
              <p className="text-sm font-bold text-stone-700">Vous n'avez pas encore passé de commande.</p>
              <Link
                href="/shop"
                className="inline-block text-xs font-extrabold text-emerald-600 hover:underline"
              >
                Découvrir la boutique
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 hover:border-emerald-200 transition"
                >
                  <div className="flex flex-wrap justify-between items-center pb-3 border-b border-stone-100 gap-2">
                    <div>
                      <span className="text-xs font-extrabold text-stone-900">
                        Commande #{order.orderNumber}
                      </span>
                      <span className="block text-[11px] text-stone-400">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                      <Link
                        href={`/shop/account/orders/${order.id}`}
                        className="p-2 bg-stone-50 hover:bg-stone-100 rounded-xl text-stone-600 transition"
                      >
                        <FiChevronRight size={18} />
                      </Link>
                    </div>
                  </div>

                  {/* Liste abrégée des articles */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs text-stone-700">
                        <span>
                          <strong className="text-stone-900">{item.quantity}x</strong> {item.product.name_fr}
                        </span>
                        <span className="font-bold text-stone-900">
                          {(item.price * item.quantity).toFixed(2)} MAD
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex justify-between items-center text-xs">
                    <span className="text-stone-500">
                      Paiement : <strong className="text-stone-800 uppercase">{order.paymentMethod.replace(/_/g, " ")}</strong>
                    </span>
                    <span className="text-sm font-extrabold text-emerald-600">
                      Total : {order.totalAmount.toFixed(2)} MAD
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}