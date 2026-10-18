"use client";

import { useLanguage } from "@/context/LanguageContext";

interface PriceProps {
  amountInMAD: number;
  className?: string;
}

// Taux de conversion de référence (MAD vers EUR / USD)
const RATES = {
  MAD: 1,
  EUR: 0.092, // 100 MAD ≈ 9.20 €
  USD: 0.10,  // 100 MAD ≈ 10.00 $
};

const SYMBOLS = {
  MAD: "DH",
  EUR: "€",
  USD: "$",
};

export default function Price({ amountInMAD, className }: PriceProps) {
  const { currency = "MAD" } = useLanguage() as any;

  const rate = RATES[currency as keyof typeof RATES] || 1;
  const symbol = SYMBOLS[currency as keyof typeof SYMBOLS] || "DH";
  const convertedAmount = (amountInMAD * rate).toFixed(2);

  return (
    <span className={className}>
      {currency === "USD" || currency === "EUR" ? `${symbol} ${convertedAmount}` : `${convertedAmount} ${symbol}`}
    </span>
  );
}