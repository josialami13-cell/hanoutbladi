// =============================================================
// DEXIE.JS - BASE DE DONNÉES LOCALE INDEXEDDB (OFFLINE-FIRST)
// =============================================================

import Dexie, { Table } from "dexie";

export interface LocalOrderItem {
  productId: string;
  name_fr?: string;
  price: number;
  quantity: number;
}

export interface LocalOrder {
  id?: number;
  cloudId?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address?: string;
  city?: string;
  totalAmount: number;
  paymentMethod?: string;
  shippingMode?: string;
  items: LocalOrderItem[];
  synced: boolean; // false = En attente de synchronisation cloud
  createdAt: Date;
}

export class HanoutBladiLocalDB extends Dexie {
  orders!: Table<LocalOrder>;

  constructor() {
    super("HanoutBladiLocal");
    this.version(1).stores({
      orders: "++id, cloudId, orderNumber, customerPhone, synced, createdAt",
    });
  }
}

export const dbLocal = new HanoutBladiLocalDB();