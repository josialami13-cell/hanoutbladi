// =============================================================
// COMPOSANT WHATSAPP FLOTTANT
// =============================================================
// Bouton vert WhatsApp fixé en bas à droite de l'écran.
// Quand le client clique, ça ouvre WhatsApp avec un message pré-rempli.
// =============================================================

"use client";

import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
  // Numéro WhatsApp (à modifier avec votre numéro)
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212661337729";

  // Message pré-rempli quand le client clique
  const message = encodeURIComponent(
    "Bonjour Hanout Bladi 👋\nJe suis intéressé par vos produits !\nPuis-je avoir plus d'informations ?"
  );

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full 
                 flex items-center justify-center text-white text-3xl shadow-lg
                 hover:scale-110 transition-transform duration-300
                 animate-pulse hover:animate-none"
      aria-label="Contactez-nous sur WhatsApp"
    >
      <FaWhatsapp />
    </a>
  );
}
