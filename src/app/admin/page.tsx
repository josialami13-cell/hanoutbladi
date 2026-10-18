"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FiPackage, 
  FiShoppingBag, 
  FiTruck, 
  FiDollarSign, 
  FiRefreshCw,
  FiCreditCard,
  FiFolder,
  FiGrid,
  FiLayers,
  FiBox,
  FiUsers,
  FiHome,
  FiSettings,
  FiShoppingCart
} from "react-icons/fi";

interface CategoryItem {
  id: string;
}

interface DepartmentData {
  id: string;
  categories?: CategoryItem[];
}

interface OrderData {
  id: string;
  totalAmount?: number;
}

interface ProductItem {
  id: string;
}

interface ProductResponse {
  products?: ProductItem[];
  length?: number;
}

interface UserItem {
  id: string;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [departmentsCount, setDepartmentsCount] = useState<number>(0);
  const [categoriesCount, setCategoriesCount] = useState<number>(0);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      async function loadDashboardData() {
        setIsLoadingData(true);
        try {
          const [deptRes, prodRes, orderRes, userRes] = await Promise.all([
            fetch("/api/admin/departments").catch(() => null),
            fetch("/api/admin/products").catch(() => null),
            fetch("/api/admin/orders").catch(() => null),
            fetch("/api/admin/users").catch(() => null),
          ]);

          // Départements et Catégories
          if (deptRes && deptRes.ok) {
            const depts: DepartmentData[] = await deptRes.json();
            const deptList = Array.isArray(depts) ? depts : [];
            setDepartmentsCount(deptList.length);
            
            let totalCats = 0;
            deptList.forEach((d) => {
              if (d.categories && Array.isArray(d.categories)) {
                totalCats += d.categories.length;
              }
            });
            setCategoriesCount(totalCats);
          }

          // Produits
          if (prodRes && prodRes.ok) {
            const prods: ProductResponse | ProductItem[] = await prodRes.json();
            if (Array.isArray(prods)) {
              setProductsCount(prods.length);
            } else if (prods && Array.isArray(prods.products)) {
              setProductsCount(prods.products.length);
            }
          }

          // Commandes et Chiffre d'affaires
          if (orderRes && orderRes.ok) {
            const orders: OrderData[] = await orderRes.json();
            const orderList = Array.isArray(orders) ? orders : [];
            setOrdersCount(orderList.length);
            
            const revenue = orderList.reduce(
              (acc, item) => acc + (Number(item.totalAmount) || 0),
              0
            );
            setTotalRevenue(revenue);
          }

          // Utilisateurs
          if (userRes && userRes.ok) {
            const users = await userRes.json();
            const userList: UserItem[] = Array.isArray(users) ? users : users.users || [];
            setUsersCount(userList.length);
          }

        } catch (err) {
          console.error("Erreur de chargement des données :", err);
        } finally {
          setIsLoadingData(false);
        }
      }

      loadDashboardData();
    }
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="p-12 text-center text-gray-400 font-medium">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Tableau de Bord & Gestion des Tables</h1>
          <p className="text-sm text-gray-500 mt-1">
            Connecté en tant que : <span className="font-semibold text-emerald-600">{session?.user?.email}</span>
          </p>
        </div>
        {isLoadingData && (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <FiRefreshCw className="animate-spin" /> Actualisation...
          </div>
        )}
      </div>

      {/* MÉTRIQUES CLÉS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link href="/admin/orders" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-emerald-500 transition block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chiffre d'affaires</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><FiDollarSign size={18} /></div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-4">{totalRevenue.toFixed(2)} MAD</p>
        </Link>

        <Link href="/admin/orders" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 transition block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Commandes</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><FiShoppingBag size={18} /></div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-4">{ordersCount}</p>
        </Link>

        <Link href="/admin/products" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-purple-500 transition block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Produits</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><FiPackage size={18} /></div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-4">{productsCount}</p>
        </Link>

        <Link href="/admin/users" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-indigo-500 transition block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Utilisateurs</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><FiUsers size={18} /></div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-4">{usersCount}</p>
        </Link>

        <Link href="/admin/departments" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-amber-500 transition block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rayons (Dept / Cat)</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><FiGrid size={18} /></div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-4">{departmentsCount} / {categoriesCount}</p>
        </Link>
      </div>

      {/* ACCÈS RAPIDE À TOUS LES MODULES DES TABLES */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Gestion Complète des Tables & Entités</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. Départements */}
          <Link href="/admin/departments" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-amber-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiGrid className="text-xl text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">1. Départements</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Rayons principaux bilingues (Produits du terroir, Artisanat, etc.).</p>
            </div>
          </Link>

          {/* 2. Catégories */}
          <Link href="/admin/categories" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiFolder className="text-xl text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">2. Catégories</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Sous-familles de produits et organisation thématique.</p>
            </div>
          </Link>

          {/* 3. Produits */}
          <Link href="/admin/products" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-purple-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiPackage className="text-xl text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">3. Produits</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Catalogue d'articles, prix, fiches et visuels.</p>
            </div>
          </Link>

          {/* 4. Stocks & Entrepôts */}
          <Link href="/admin/stores" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiBox className="text-xl text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">4. Stocks & Entrepôts</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Suivi quantitatif et alertes de réapprovisionnement.</p>
            </div>
          </Link>

          {/* 5. Utilisateurs */}
          <Link href="/admin/users" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-indigo-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiUsers className="text-xl text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">5. Utilisateurs</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Gestion des comptes clients et de l'administrateur.</p>
            </div>
          </Link>

          {/* 6. Commandes */}
          <Link href="/admin/orders" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiShoppingBag className="text-xl text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">6. Commandes</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Suivi des achats en ligne et validation des paniers.</p>
            </div>
          </Link>

          {/* 7. Achats & Approvisionnement */}
          <Link href="/admin/purchases" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-sky-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiShoppingCart className="text-xl text-sky-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">7. Achats & Approvisionnements</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Achats de stock auprès des producteurs et coopératives.</p>
            </div>
          </Link>

          {/* 8. Paiements */}
          <Link href="/admin/payments" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-teal-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiCreditCard className="text-xl text-teal-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">8. Paiements</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Transactions et modes de règlement (COD, Virement, etc.).</p>
            </div>
          </Link>

          {/* 9. Livraisons */}
          <Link href="/admin/deliveries" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-cyan-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiTruck className="text-xl text-cyan-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">9. Livraisons</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Statuts d'expédition et suivi logistique.</p>
            </div>
          </Link>

          {/* 10. Fournisseurs */}
          <Link href="/admin/suppliers" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-rose-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiHome className="text-xl text-rose-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">10. Fournisseurs</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Coopératives et producteurs locaux partenaires.</p>
            </div>
          </Link>

          {/* 11. Configuration */}
          <Link href="/admin/settings" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-slate-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiSettings className="text-xl text-slate-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">11. Configuration</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Paramètres globaux et métadonnées du site.</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}