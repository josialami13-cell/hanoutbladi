export const POINTS_PER_REWARD = 500;
export const REWARD_VALUE_MAD = 10;
export const MAX_LOYALTY_DISCOUNT_PERCENT = 20;

export function discountForLoyaltyPoints(points: number): number {
  const redeemableBlocks = Math.floor(Math.max(0, points) / POINTS_PER_REWARD);
  return redeemableBlocks * REWARD_VALUE_MAD;
}

export function maxRedeemablePoints(balance: number, subtotal: number): number {
  const capBlocks = Math.floor(
    (Math.max(0, subtotal) * MAX_LOYALTY_DISCOUNT_PERCENT / 100) / REWARD_VALUE_MAD,
  );
  return Math.min(Math.floor(Math.max(0, balance) / POINTS_PER_REWARD), capBlocks) * POINTS_PER_REWARD;
}
