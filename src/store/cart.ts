// =============================================================
// PANIER D'ACHAT - Zustand Store (Optimisé, Hydraté & Sécurisé Stock)
// =============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";

export interface CartItem {
  id: string;        // ID du produit
  name_fr: string;   // Nom en français
  name_ar?: string;  // Nom en arabe (optionnel)
  price: number;     // Prix unitaire
  image: string;     // Image du produit
  quantity: number;  // Quantité dans le panier
  stock: number;     // Stock maximum disponible
}

interface CartStore {
  items: CartItem[];
  hasHydrated: boolean; // Pour gérer l'hydratation SSR/Client proprement
  setHasHydrated: (state: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),

      // --- AJOUTER UN ARTICLE (Vérification du stock) ---
      addItem: (item, quantity = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);
        const currentQtyInCart = existingItem ? existingItem.quantity : 0;
        const totalRequested = currentQtyInCart + quantity;

        // Sécurité stock
        if (totalRequested > item.stock) {
          toast.error("Stock insuffisant pour ajouter cette quantité.");
          return;
        }

        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.id === item.id ? { ...i, quantity: totalQuantity(totalRequested, i.stock) } : i
            ),
          });
        } else {
          set({ items: [...currentItems, { ...item, quantity }] });
        }
        toast.success("Produit ajouté au panier !");
      },

      // --- SUPPRIMER UN ARTICLE ---
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      // --- MODIFIER LA QUANTITÉ (Vérification du stock) ---
      updateQuantity: (id, quantity) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return;

        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
          return;
        }

        // Vérification si la nouvelle quantité dépasse le stock
        if (quantity > item.stock) {
          toast.error(`Stock maximal atteint (${item.stock} disponibles).`);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
      },

      // --- VIDER LE PANIER ---
      clearCart: () => set({ items: [] }),

      // --- NOMBRE TOTAL D'ARTICLES ---
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // --- PRIX TOTAL ---
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "hanoutbladi-cart",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Petite fonction utilitaire interne pour borner la quantité au stock
function totalQuantity(requested: number, stock: number) {
  return requested > stock ? stock : requested;
}