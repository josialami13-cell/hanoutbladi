// =============================================================
// COMPOSANT ADMIN SIDEBAR - Menu latéral fixe en Français
// =============================================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  FiPackage, 
  FiGrid, 
  FiShoppingBag, 
  FiLogOut, 
  FiHome, 
  FiTrendingUp, 
  FiFolder, 
  FiCreditCard, 
  FiTruck,
  FiBriefcase,
  FiBox,
  FiUsers,
  FiLayers,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiUserCheck,
  FiShoppingCart,
  FiStar,
} from "react-icons/fi";

export default function AdminSidebar() {
  const pathname = usePathname();

  const [openSections, setOpenSections] = useState({
    stock: true,
    orders: true,
    logistics: true,
    purchases: false,
    system: false,
  });

  // Ouverture automatique de l'accordéon selon la page active
  useEffect(() => {
    if (!pathname) return;
    if (["/admin/departments", "/admin/categories", "/admin/products", "/admin/stores"].some(p => pathname.startsWith(p))) {
      setOpenSections(prev => ({ ...prev, stock: true }));
    } else if (["/admin/orders", "/admin/order-items", "/admin/payments", "/admin/clients", "/admin/bundles", "/admin/reviews"].some(p => pathname.startsWith(p))) {
      setOpenSections(prev => ({ ...prev, orders: true }));
    } else if (["/admin/deliveries", "/admin/delivery-men"].some(p => pathname.startsWith(p))) {
      setOpenSections(prev => ({ ...prev, logistics: true }));
    } else if (["/admin/suppliers", "/admin/purchases"].some(p => pathname.startsWith(p))) {
      setOpenSections(prev => ({ ...prev, purchases: true }));
    } else if (["/admin/users", "/admin/settings"].some(p => pathname.startsWith(p))) {
      setOpenSections(prev => ({ ...prev, system: true }));
    }
  }, [pathname]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const isActive = (path: string) => pathname === path || (path !== "/admin" && pathname?.startsWith(path));

  const linkClass = (path: string) => 
    `flex items-center gap-3 px-3 py-2 rounded-xl transition text-xs font-semibold ${
      isActive(path)
        ? "bg-emerald-600 text-white shadow-sm"
        : "text-gray-400 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-5 flex flex-col justify-between shrink-0 border-r border-gray-800">
      <div className="space-y-4">
        {/* Logo admin */}
        <div className="px-2">
          <h2 className="text-lg font-bold tracking-tight">
            Hanout<span className="text-emerald-500">Bladi</span>
          </h2>
          <p className="text-[10px] text-gray-400">Administration Générale</p>
        </div>

        {/* Navigation principale */}
        <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)] pr-1 custom-scrollbar">
          
          {/* Accueil Dashboard */}
          <div>
            <Link href="/admin" className={linkClass("/admin")}>
              <FiTrendingUp className="text-base shrink-0" />
              <span className="truncate">Tableau de bord</span>
            </Link>
          </div>

          {/* GROUPE 1 : STOCK & CATALOGUE */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection("stock")}
              className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 hover:bg-gray-800/50 rounded-xl transition cursor-pointer"
            >
              <span className="truncate">📦 Stock & Catalogue</span>
              {openSections.stock ? <FiChevronDown size={14} className="shrink-0" /> : <FiChevronRight size={14} className="shrink-0" />}
            </button>
            {openSections.stock && (
              <div className="pl-3 space-y-1 border-l border-gray-800 ml-3">
                <Link href="/admin/departments" className={linkClass("/admin/departments")}>
                  <FiGrid className="text-sm shrink-0" /> <span className="truncate">Départements</span>
                </Link>
                <Link href="/admin/categories" className={linkClass("/admin/categories")}>
                  <FiFolder className="text-sm shrink-0" /> <span className="truncate">Catégories</span>
                </Link>
                <Link href="/admin/products" className={linkClass("/admin/products")}>
                  <FiPackage className="text-sm shrink-0" /> <span className="truncate">Produits</span>
                </Link>
                <Link href="/admin/stores" className={linkClass("/admin/stores")}>
                  <FiBox className="text-sm shrink-0" /> <span className="truncate">Stock & Entrepôts</span>
                </Link>
              </div>
            )}
          </div>

          {/* GROUPE 2 : COMMANDES & VENTES */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection("orders")}
              className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 hover:bg-gray-800/50 rounded-xl transition cursor-pointer"
            >
              <span className="truncate">🛒 Commandes & Ventes</span>
              {openSections.orders ? <FiChevronDown size={14} className="shrink-0" /> : <FiChevronRight size={14} className="shrink-0" />}
            </button>
            {openSections.orders && (
              <div className="pl-3 space-y-1 border-l border-gray-800 ml-3">
                <Link href="/admin/orders" className={linkClass("/admin/orders")}>
                  <FiShoppingBag className="text-sm shrink-0" /> <span className="truncate">Commandes</span>
                </Link>
                <Link href="/admin/order-items" className={linkClass("/admin/order-items")}>
                  <FiLayers className="text-sm shrink-0" /> <span className="truncate">Lignes de Commande</span>
                </Link>
                <Link href="/admin/payments" className={linkClass("/admin/payments")}>
                  <FiCreditCard className="text-sm shrink-0" /> <span className="truncate">Paiements & Règlements</span>
                </Link>
                <Link href="/admin/clients" className={linkClass("/admin/clients")}>
                  <FiUsers className="text-sm shrink-0" /> <span className="truncate">Clients & fidélité</span>
                </Link>
                <Link href="/admin/bundles" className={linkClass("/admin/bundles")}>
                  <FiPackage className="text-sm shrink-0" /> <span className="truncate">Packs & offres</span>
                </Link>
                <Link href="/admin/reviews" className={linkClass("/admin/reviews")}>
                  <FiStar className="text-sm shrink-0" /> <span className="truncate">Avis clients</span>
                </Link>
              </div>
            )}
          </div>

          {/* GROUPE 3 : LOGISTIQUE */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection("logistics")}
              className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 hover:bg-gray-800/50 rounded-xl transition cursor-pointer"
            >
              <span className="truncate">🚚 Logistique</span>
              {openSections.logistics ? <FiChevronDown size={14} className="shrink-0" /> : <FiChevronRight size={14} className="shrink-0" />}
            </button>
            {openSections.logistics && (
              <div className="pl-3 space-y-1 border-l border-gray-800 ml-3">
                <Link href="/admin/deliveries" className={linkClass("/admin/deliveries")}>
                  <FiTruck className="text-sm shrink-0" /> <span className="truncate">Livraisons</span>
                </Link>
                <Link href="/admin/delivery-men" className={linkClass("/admin/delivery-men")}>
                  <FiUserCheck className="text-sm shrink-0" /> <span className="truncate">Livreurs</span>
                </Link>
              </div>
            )}
          </div>

          {/* GROUPE 4 : ACHATS & FOURNISSEURS */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection("purchases")}
              className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 hover:bg-gray-800/50 rounded-xl transition cursor-pointer"
            >
              <span className="truncate">🏭 Achats & Fourn.</span>
              {openSections.purchases ? <FiChevronDown size={14} className="shrink-0" /> : <FiChevronRight size={14} className="shrink-0" />}
            </button>
            {openSections.purchases && (
              <div className="pl-3 space-y-1 border-l border-gray-800 ml-3">
                <Link href="/admin/suppliers" className={linkClass("/admin/suppliers")}>
                  <FiBriefcase className="text-sm shrink-0" /> <span className="truncate">Fournisseurs</span>
                </Link>
                <Link href="/admin/purchases" className={linkClass("/admin/purchases")}>
                  <FiShoppingCart className="text-sm shrink-0" /> <span className="truncate">Approvisionnements</span>
                </Link>
              </div>
            )}
          </div>

          {/* GROUPE 5 : SYSTÈME */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection("system")}
              className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 hover:bg-gray-800/50 rounded-xl transition cursor-pointer"
            >
              <span className="truncate">⚙️ Système</span>
              {openSections.system ? <FiChevronDown size={14} className="shrink-0" /> : <FiChevronRight size={14} className="shrink-0" />}
            </button>
            {openSections.system && (
              <div className="pl-3 space-y-1 border-l border-gray-800 ml-3">
                <Link href="/admin/users" className={linkClass("/admin/users")}>
                  <FiUsers className="text-sm shrink-0" /> <span className="truncate">Utilisateurs</span>
                </Link>
                <Link href="/admin/settings" className={linkClass("/admin/settings")}>
                  <FiSettings className="text-sm shrink-0" /> <span className="truncate">Configuration</span>
                </Link>
              </div>
            )}
          </div>

        </nav>
      </div>

      <div className="space-y-2 pt-4 border-t border-gray-800 mt-2">
        {/* Lien vers le site public */}
        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-2 text-xs text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition"
        >
          <FiHome className="text-base shrink-0" />
          <span className="truncate">Voir le site</span>
        </Link>

        {/* Bouton déconnexion */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3.5 py-2 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition w-full border border-red-500/20 cursor-pointer"
        >
          <FiLogOut className="text-base shrink-0" />
          <span className="truncate">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
