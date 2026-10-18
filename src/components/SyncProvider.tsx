"use client";

import { useEffect, useRef } from "react";
import { dbLocal } from "@/lib/dbLocal";

export default function SyncProvider({ children }: { children: React.ReactNode }) {
  const isSyncing = useRef<boolean>(false);

  useEffect(() => {
    const syncDataWithCloud = async () => {
      if (!navigator.onLine || isSyncing.current) return;

      try {
        isSyncing.current = true;

        const unsyncedOrders = await dbLocal.orders
          .filter((order: any) => !order.synced)
          .toArray();

        if (unsyncedOrders.length === 0) return;

        for (const order of unsyncedOrders) {
          // Extraire proprement les champs locaux pour le backend
          const orderObj = order as any;
          const { synced, localId, ...orderPayload } = orderObj;

          const res = await fetch("/api/admin/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload),
          });

          if (res.ok) {
            const savedOrder = await res.json();
            const targetId = order.id || orderObj.localId;

            if (targetId) {
              await dbLocal.orders.update(targetId, {
                synced: true,
                ...(savedOrder.id ? { cloudId: savedOrder.id } : {}),
              });
            }
          }
        }
      } catch (err) {
        console.error("Erreur lors de la synchronisation hors-ligne:", err);
      } finally {
        isSyncing.current = false;
      }
    };

    // Synchronisation au démarrage et au retour du réseau
    window.addEventListener("online", syncDataWithCloud);
    syncDataWithCloud();

    // Vérification automatique toutes les 30 secondes
    const interval = setInterval(() => {
      if (navigator.onLine) {
        syncDataWithCloud();
      }
    }, 30000);

    return () => {
      window.removeEventListener("online", syncDataWithCloud);
      clearInterval(interval);
    };
  }, []);

  return <>{children}</>;
}