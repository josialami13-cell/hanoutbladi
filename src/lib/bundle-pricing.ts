export interface BundlePricingItem {
  quantity: number;
  product: { id: string; price: number };
}

export interface BundlePricingDefinition {
  id: string;
  discountPercent: number;
  items: BundlePricingItem[];
}

export interface BundleCartLine {
  productId: string;
  quantity: number;
  price: number;
}

/** Applies at most one eligible bundle to each unit in the cart; overlapping packs are resolved by higher discount first. */
export function calculateBundleDiscount(
  lines: BundleCartLine[],
  bundles: BundlePricingDefinition[],
): number {
  const remaining = new Map<string, number>();
  const prices = new Map<string, number>();
  for (const line of lines) {
    if (!line.productId || line.quantity <= 0) continue;
    remaining.set(line.productId, (remaining.get(line.productId) || 0) + line.quantity);
    prices.set(line.productId, line.price);
  }

  const orderedBundles = [...bundles]
    .filter((bundle) => bundle.items.length > 0 && bundle.discountPercent > 0)
    .sort((a, b) => b.discountPercent - a.discountPercent);

  let discount = 0;
  for (const bundle of orderedBundles) {
    const packs = Math.min(
      ...bundle.items.map((item) =>
        Math.floor((remaining.get(item.product.id) || 0) / Math.max(1, item.quantity)),
      ),
    );
    if (!Number.isFinite(packs) || packs <= 0) continue;

    const packSubtotal = bundle.items.reduce(
      (sum, item) => sum + (prices.get(item.product.id) || item.product.price) * item.quantity,
      0,
    );
    discount += packSubtotal * packs * Math.min(100, bundle.discountPercent) / 100;
    for (const item of bundle.items) {
      remaining.set(
        item.product.id,
        (remaining.get(item.product.id) || 0) - item.quantity * packs,
      );
    }
  }

  return Math.round(discount * 100) / 100;
}
