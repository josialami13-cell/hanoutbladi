"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import TranslatedText from "@/components/TranslatedText";
import { FiArrowLeft, FiPackage, FiUser, FiPhone, FiMapPin, FiCalendar, FiDollarSign } from "react-icons/fi";

interface OrderItemDetail {
  id: string;
  quantity: number;
  price: number;
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    address: string;
    city: string;
    status: string;
    createdAt: string;
    paymentMethod: string;
  };
  product: {
    id: string;
    name_fr: string;
    name_ar?: string | null;
    images?: string[];
    price: number;
    sku?: string | null;
  };
}

export default function AdminOrderItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [orderItem, setOrderItem] = useState<OrderItemDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (itemId) {
      fetchOrderItemDetail();
    }
  }, [itemId]);

  const fetchOrderItemDetail = async () => {
    try {
      // Appel à une API dédiée ou récupération via les commandes globales
      const res = await fetch(`/api/admin/order-items/${itemId}`);
      if (res.ok) {
        const data = await res.json();
        setOrderItem(data);
      } else {
        toast.error("Ligne de commande introuvable.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur serveur lors de la récupération.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center text-xs text-stone-400">
        Chargement des détails...
      </div>
    );
  }

  if (!orderItem) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 space-y-4">
        <p className="text-xs text-stone-600 font-medium">Ligne de commande introuvable.</p>
        <Link
          href="/admin/order-items"
          className="bg-[#2C3E2D] text-white px-4 py-2 rounded-xl text-xs font-bold"
        >
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F5] min-h-screen p-6 sm:p-8 space-y-8 selection:bg-[#2C3E2D] selection:text-white">
      
      {/* Barre de retour & En-tête */}
      <div className="flex items-center gap-4 pb-4 border-b border-stone-200">
        <Link
          href="/admin/order-items"
          className="p-2.5 bg-white rounded-2xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition shadow-2xs"
        >
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <TranslatedText text="Détail de la Ligne :" arText="تفاصيل السطر :" /> 
            <span className="text-[#C5A059]">#{orderItem.id}</span>
          </h1>
          <p className="text-xs text-stone-500 font-light">
            <TranslatedText text="Informations détaillées sur cet article commandé" arText="معلومات تفصيلية حول هذا المنتج المطلوبة" />
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Bloc Produit */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/95 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-[#2C3E2D] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-stone-100">
            <FiPackage size={16} /> <TranslatedText text="Article / Produit" arText="المنتج" />
          </h2>

          <div className="flex items-center gap-4">
            {orderItem.product?.images?.[0] && (
              <img
                src={orderItem.product.images[0]}
                alt=""
                className="w-20 h-20 object-cover rounded-xl border border-stone-200 shadow-2xs"
              />
            )}
            <div className="space-y-1">
              <p className="font-bold text-sm text-stone-900">{orderItem.product?.name_fr}</p>
              {orderItem.product?.name_ar && (
                <p className="text-xs text-stone-500">{orderItem.product.name_ar}</p>
              )}
              {orderItem.product?.sku && (
                <p className="text-[10px] text-stone-400">SKU : {orderItem.product.sku}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500">Quantité commandée :</span>
              <span className="font-extrabold text-[#C5A059]">x{orderItem.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Prix unitaire :</span>
              <span className="font-bold text-stone-800">{orderItem.price.toFixed(2)} MAD</span>
            </div>
            <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-100">
              <span>Total de la ligne :</span>
              <span className="text-[#2C3E2D]">{(orderItem.price * orderItem.quantity).toFixed(2)} MAD</span>
            </div>
          </div>
        </div>

        {/* Bloc Commande & Client */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/95 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-[#2C3E2D] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-stone-100">
            <FiUser size={16} /> <TranslatedText text="Commande & Client associé" arText="الطلب والزبون المرتبط" />
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-stone-500">N° de Commande :</span>
              <Link href={`/admin/orders`} className="font-serif font-bold text-[#C5A059] underline">
                #{orderItem.order.orderNumber}
              </Link>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-stone-500">Client :</span>
              <span className="font-bold text-stone-900">{orderItem.order.customerName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-stone-500">Téléphone :</span>
              <span className="font-semibold text-stone-800">{orderItem.order.customerPhone}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-stone-500">Adresse de livraison :</span>
              <span className="font-medium text-stone-800 text-right">{orderItem.order.address}, {orderItem.order.city}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-stone-100">
              <span className="text-stone-500">Statut global :</span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                {orderItem.order.status}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}