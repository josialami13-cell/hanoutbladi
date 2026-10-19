// =============================================================
// COMPOSANT ADMIN DASHBOARD - 100% Flexible (Mobile, Tablette, PC)
// =============================================================

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
  FiBox,
  FiUsers,
  FiHome,
  FiSettings,
  FiShoppingCart,
  FiImage,
  FiUserPlus,
  FiFileText,
  FiStar
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
    <div className="space-y-6 sm:space-y-8 pb-12 px-2 sm:px-0">
      
      {/* En-tête flexible */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">Tableau de Bord HanoutBladi</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Connecté : <span className="font-semibold text-emerald-600 truncate">{session?.user?.email}</span>
          </p>
        </div>
        {isLoadingData && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            <FiRefreshCw className="animate-spin text-emerald-600" /> <span>Actualisation...</span>
          </div>
        )}
      </div>

      {/* MÉTRIQUES CLÉS (Flexible Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        
        <Link href="/admin/orders" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:border-emerald-500 transition block">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Chiffre d'affaires</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><FiDollarSign size={18} /></div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900 mt-3">{totalRevenue.toFixed(2)} MAD</p>
        </Link>

        <Link href="/admin/orders" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 transition block">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Commandes</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><FiShoppingBag size={18} /></div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900 mt-3">{ordersCount}</p>
        </Link>

        <Link href="/admin/products" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:border-purple-500 transition block">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Produits</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><FiPackage size={18} /></div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900 mt-3">{productsCount}</p>
        </Link>

        <Link href="/admin/users" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:border-indigo-500 transition block">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Utilisateurs</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><FiUsers size={18} /></div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900 mt-3">{usersCount}</p>
        </Link>

        <Link href="/admin/departments" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:border-amber-500 transition block sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Rayons (Dept/Cat)</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><FiGrid size={18} /></div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900 mt-3">{departmentsCount} / {categoriesCount}</p>
        </Link>

      </div>

      {/* GESTION COMPLÈTE DES TABLES & ENTITÉS (Responsive Grid) */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 px-1">Gestion Complète des Tables & Entités</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* 1. Départements */}
          <Link href="/admin/departments" className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-amber-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiGrid className="text-lg text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">1. Départements</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Rayons principaux bilingues.</p>
            </div>
          </Link>

          {/* 2. Catégories */}
          <Link href="/admin/categories" className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiFolder className="text-lg text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">2. Catégories</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Sous-familles de produits.</p>
            </div>
          </Link>

          {/* 3. Produits */}
          <Link href="/admin/products" className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-purple-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiPackage className="text-lg text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">3. Produits</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Catalogue, prix et fiches.</p>
            </div>
          </Link>

          {/* 4. Stocks & Entrepôts */}
          <Link href="/admin/stores" className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiBox className="text-lg text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">4. Stocks & Entrepôts</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Suivi quantitatif et alertes.</p>
            </div>
          </Link>

          {/* 5. Utilisateurs */}
          <Link href="/admin/users" className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-indigo-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiUsers className="text-lg text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">5. Utilisateurs</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Comptes et permissions.</p>
            </div>
          </Link>

          {/* 6. Commandes */}
          <Link href="/admin/orders" className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiShoppingBag className="text-lg text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">6. Commandes</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Achats en ligne et validation.</p>
            </div>
          </Link>

          {/* 7. Facturation (Nouveau) */}
          <Link href="/admin/invoices" className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-emerald-600 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiFileText className="text-lg text-emerald-700" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">7. Facturation</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Factures multi-sociétés (Plaza, FS Pro...).</p>
            </div>
          </Link>

          {/* 8. Commerciaux (Nouveau) */}
          <Link href="/admin/commercials" className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-violet-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiUserPlus className="text-lg text-violet-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">8. Commerciaux</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Agents, portefeuilles et commissions.</p>
            </div>
          </Link>

          {/* 9. Bannières & Publicités (Nouveau) */}
          <Link href="/admin/banners" className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-pink-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 bg-pink-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiImage className="text-lg text-pink-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">9. Bannières & Pubs</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Gestion des bannières publicitaires.</p>
            </div>
          </Link>

          {/* 10. Achats & Approvisionnement */}
          <Link href="/admin/purchases" className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-sky-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 bg-sky-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiShoppingCart className="text-lg text-sky-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">10. Approvisionnements</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Achats de stock auprès des sources.</p>
            </div>
          </Link>

          {/* 11. Paiements */}
          <Link href="/admin/payments" className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-teal-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiCreditCard className="text-lg text-teal-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">11. Paiements</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Transactions et règlements.</p>
            </div>
          </Link>

          {/* 12. Livraisons */}
          <Link href="/admin/deliveries" className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-cyan-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 bg-cyan-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiTruck className="text-lg text-cyan-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">12. Livraisons</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Statuts d'expédition et livreurs.</p>
            </div>
          </Link>

          {/* 13. Fournisseurs */}
          <Link href="/admin/suppliers" className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-rose-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiHome className="text-lg text-rose-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">13. Fournisseurs</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Coopératives et partenaires.</p>
            </div>
          </Link>

          {/* 14. Configuration */}
          <Link href="/admin/settings" className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-slate-500 hover:shadow-md transition group flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiSettings className="text-lg text-slate-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">14. Configuration</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Paramètres globaux du site.</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}