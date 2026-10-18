
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  FiSearch, 
  FiPlus, 
  FiUser, 
  FiEdit2, 
  FiTrash2, 
  FiCheckSquare, 
  FiLock 
} from "react-icons/fi";

// قائمة الصلاحيات المتاحة للتسيير والمأخوذة من أقسام Sidebar
const AVAILABLE_PERMISSIONS = [
  { id: "MANAGE_PRODUCTS", label: "Voir les produits (المنتجات)" },
  { id: "CREATE_PRODUCT", label: "Ajouter produit (إضافة منتج)" },
  { id: "EDIT_PRODUCT", label: "Modifier produit (تعديل منتج)" },
  { id: "DELETE_PRODUCT", label: "Supprimer produit (حذف منتج)" },
  { id: "MANAGE_ORDERS", label: "Gestion des commandes (الطلبات)" },
  { id: "MANAGE_CATEGORIES", label: "Gestion des catégories (الأقسام)" },
  { id: "MANAGE_BANNERS", label: "Gestion des bannières (البانرات)" },
  { id: "MANAGE_SETTINGS", label: "Paramètres du site (الإعدادات)" },
  { id: "MANAGE_USERS", label: "Gestion des utilisateurs (المستخدمين)" },
];

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  permissions: string[];
  createdAt?: string;
}

export default function AdminUsersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Formulaire d'ajout d'utilisateur avec permissions (Checkboxes)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    "MANAGE_PRODUCTS",
    "MANAGE_ORDERS",
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.users || []);
      } else {
        toast.error("Erreur de chargement des utilisateurs");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllPermissions = () => {
    if (selectedPermissions.length === AVAILABLE_PERMISSIONS.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(AVAILABLE_PERMISSIONS.map((p) => p.id));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return toast.error("Email et mot de passe obligatoires.");
    }
    if (password.length < 6) {
      return toast.error("Le mot de passe doit contenir au moins 6 caractères.");
    }

    setSubmitting(true);

    try {
      const payload = {
        name: name.trim() || null,
        email: email.trim(),
        password,
        permissions: selectedPermissions,
      };

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Utilisateur créé avec succès !");
        setName("");
        setEmail("");
        setPassword("");
        setSelectedPermissions(["MANAGE_PRODUCTS", "MANAGE_ORDERS"]);
        setShowForm(false);
        fetchUsers();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Erreur de création");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, userEmail: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer l'utilisateur "${userEmail}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Utilisateur supprimé !");
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Erreur de suppression");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  const filteredUsers = (users || []).filter((user) => {
    const term = searchTerm.toLowerCase();
    const userName = (user.name || "").toLowerCase();
    const userEmail = (user.email || "").toLowerCase();
    const userPermissions = (user.permissions || []).join(" ").toLowerCase();

    return userName.includes(term) || userEmail.includes(term) || userPermissions.includes(term);
  });

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 font-medium">
        Chargement des utilisateurs...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-xs text-gray-500 mt-1">
            Total : {filteredUsers.length} utilisateur(s) enregistré(s)
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <FiPlus size={18} /> {showForm ? "Fermer" : "Ajouter un utilisateur"}
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-3">
        <FiSearch className="text-gray-400 text-lg ml-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par nom, email ou permission..."
          className="w-full bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 bg-gray-100 rounded-lg cursor-pointer"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Formulaire d'ajout rapide avec Checkboxes de Permissions */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Nouvel Utilisateur</h2>
          
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700">Nom complet</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Ex: Utilisation Hanout"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="user@hanoutbladi.ma"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700">Mot de passe *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Section Checkboxes - Permissions de la Sidebar & Gestions */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FiCheckSquare className="text-emerald-600" size={16} />
                  Permissions & Accès Sidebar (خانات التسيير)
                </span>
                <button
                  type="button"
                  onClick={handleSelectAllPermissions}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold cursor-pointer"
                >
                  {selectedPermissions.length === AVAILABLE_PERMISSIONS.length
                    ? "Tout décocher"
                    : "Tout cocher"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center gap-2.5 text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-gray-200 hover:border-emerald-400 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => handlePermissionToggle(perm.id)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-medium">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Création..." : "Enregistrer l'utilisateur"}
            </button>
          </form>
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Utilisateur</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Email</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Permissions (الصلاحيات)</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Date de création</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-sm font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <FiUser size={14} />
                  </div>
                  {user.name || "Sans nom"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-3 text-xs">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {(user.permissions || []).length > 0 ? (
                      user.permissions.map((p) => (
                        <span
                          key={p}
                          className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold text-[10px]"
                        >
                          {p.replace("_", " ")}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 italic text-[11px] flex items-center gap-1">
                        <FiLock size={12} /> Aucune permission
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                    >
                      <FiEdit2 size={14} /> Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id, user.email)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <FiTrash2 size={14} /> Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Aucun utilisateur trouvé.
          </div>
        )}
      </div>
    </div>
  );
}