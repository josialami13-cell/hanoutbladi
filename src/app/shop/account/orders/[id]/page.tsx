"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiPackage,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiShoppingBag,
} from "react-icons/fi";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (err) {
      console.error("Erreur chargement commande:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF6] py-16 text-center text-stone-500 font-bold text-sm">
        Chargement des détails de la commande...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8FAF6] py-16 text-center space-y-4">
        <p className="text-sm font-bold text-stone-700">Commande introuvable.</p>
        <Link href="/shop/account" className="text-xs font-bold text-emerald-600 hover:underline">
          Retourner à mon compte
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <Link
        href="/shop/account"
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-emerald-600 transition"
      >
        <FiArrowLeft /> Mes commandes
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-wrap justify-between items-center pb-4 border-b border-stone-100 gap-2">
          <div>
            <h1 className="text-xl font-extrabold text-stone-900">
              Commande #{order.orderNumber}
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Passée le {new Date(order.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1">
            <FiCheckCircle size={14} /> {order.status}
          </span>
        </div>

        {/* Adresse de livraison */}
        <div className="space-y-2">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1">
            <FiMapPin /> Adresse de livraison
          </h2>
          <div className="p-4 bg-stone-50 rounded-2xl text-xs text-stone-800 space-y-1">
            <p className="font-bold">{order.customerName}</p>
            <p>{order.address}, {order.city}</p>
            <p className="text-stone-500">Tél : {order.customerPhone}</p>
          </div>
        </div>

        {/* Produits commandés */}
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1">
            <FiShoppingBag /> Articles
          </h2>
          <div className="space-y-2">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-xs p-3 border border-stone-100 rounded-xl">
                <div>
                  <p className="font-bold text-stone-900">{item.product?.name_fr || "Produit"}</p>
                  <p className="text-stone-400">Qté : {item.quantity}</p>
                </div>
                <span className="font-extrabold text-emerald-600">
                  {(item.price * item.quantity).toFixed(2)} MAD
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bilan financier */}
        <div className="pt-4 border-t border-stone-100 space-y-2 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Frais de livraison ({order.shippingMode})</span>
            <span>{order.delivery?.shippingFee ? `${order.delivery.shippingFee.toFixed(2)} MAD` : "Inclus"}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-100">
            <span>Total payé</span>
            <span className="text-emerald-600">{order.totalAmount.toFixed(2)} MAD</span>
          </div>
        </div>
      </div>
    </div>
  );
}