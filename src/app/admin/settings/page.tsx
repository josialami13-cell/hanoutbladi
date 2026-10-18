
// =============================================================
// PAGE ADMIN CONFIGURATION COMPLÈTE - Domaine Plaza D'Oliviers
// =============================================================

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { 
  FiSettings, 
  FiSave, 
  FiRefreshCw, 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiBell, 
  FiTruck,
  FiClock,
  FiImage,
  FiVideo,
  FiCreditCard,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiLayers
} from "react-icons/fi";

interface OpeningHour {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

interface SettingsForm {
  // Coordonnées & Domaine
  storeName: string;
  storeTagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  currency: string;
  
  // Stocks
  defaultMinStockAlert: number;

  // Images du site
  logoUrl: string;
  aboutImageUrl: string;

  // Carrousel de bannières publicitaires (Plusieurs images)
  heroBanners: string[];

  // Horaires
  openingHours: OpeningHour[];

  // Logistique & Livraison
  enableHomeDelivery: boolean;
  enablePickup: boolean;
  standardShippingFee: number;
  expressShippingFee: number;

  // Modes de Paiement acceptés
  paymentCashOnDelivery: boolean;
  paymentBankTransfer: boolean;
  paymentCashPlus: boolean;
  paymentCreditCard: boolean;

  // Vidéos du site (YouTube / liens)
  videoUrls: string[];
}

const DEFAULT_HOURS: OpeningHour[] = [
  { day: "Lundi", open: "08:30", close: "18:30", closed: false },
  { day: "Mardi", open: "08:30", close: "18:30", closed: false },
  { day: "Mercredi", open: "08:30", close: "18:30", closed: false },
  { day: "Jeudi", open: "08:30", close: "18:30", closed: false },
  { day: "Vendredi", open: "08:30", close: "18:30", closed: false },
  { day: "Samedi", open: "08:30", close: "16:00", closed: false },
  { day: "Dimanche", open: "09:00", close: "14:00", closed: true },
];

export default function AdminSettingsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newVideoInput, setNewVideoInput] = useState("");
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const [settings, setSettings] = useState<SettingsForm>({
    storeName: "Plaza D'Oliviers",
    storeTagline: "Domaine oléicole, produits de terroir & épicerie fine",
    contactEmail: "contact@plazadoliviers.ma",
    contactPhone: "+212 6 00 00 00 00",
    address: "Route de Marrakech, Km 5",
    city: "Settat",
    currency: "MAD",
    defaultMinStockAlert: 5,
    logoUrl: "/images/logo.png",
    aboutImageUrl: "/images/about-farm.jpg",
    heroBanners: ["/images/hero-bg.jpg"],
    openingHours: DEFAULT_HOURS,
    enableHomeDelivery: true,
    enablePickup: true,
    standardShippingFee: 30,
    expressShippingFee: 50,
    paymentCashOnDelivery: true,
    paymentBankTransfer: true,
    paymentCashPlus: true,
    paymentCreditCard: false,
    videoUrls: ["https://www.youtube.com/watch?v=example1"],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSettings();
    }
  }, [status]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setSettings((prev) => ({
            ...prev,
            ...data,
            heroBanners: data.heroBanners || (data.heroBannerUrl ? [data.heroBannerUrl] : []),
            openingHours: data.openingHours || DEFAULT_HOURS,
            videoUrls: data.videoUrls || [],
          }));
        }
      }
    } catch (error) {
      console.error("Erreur chargement paramètres:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setSettings((prev) => ({ ...prev, [name]: checked }));
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Upload d'image simple (Logo, About Image)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof SettingsForm) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingField(fieldName as string);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setSettings((prev) => ({ ...prev, [fieldName]: data.url }));
          toast.success("Image téléchargée avec succès !");
        }
      } else {
        toast.error("Échec du téléchargement de l'image.");
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      toast.error("Erreur réseau lors de l'upload.");
    } finally {
      setUploadingField(null);
    }
  };

  // Upload d'une nouvelle bannière pour le Carrousel
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingField("carrousel");
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          if (data.url) uploadedUrls.push(data.url);
        }
      } catch (err) {
        console.error("Erreur d'upload d'une bannière:", err);
      }
    }

    if (uploadedUrls.length > 0) {
      setSettings((prev) => ({
        ...prev,
        heroBanners: [...prev.heroBanners, ...uploadedUrls],
      }));
      toast.success(`${uploadedUrls.length} image(s) ajoutée(s) au carrousel !`);
    } else {
      toast.error("Erreur lors de l'upload des bannières.");
    }
    setUploadingField(null);
  };

  const handleRemoveBanner = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      heroBanners: prev.heroBanners.filter((_, i) => i !== index),
    }));
  };

  const handleHourChange = (index: number, field: keyof OpeningHour, value: any) => {
    const updatedHours = [...settings.openingHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setSettings((prev) => ({ ...prev, openingHours: updatedHours }));
  };

  const handleAddVideo = () => {
    if (!newVideoInput.trim()) return;
    setSettings((prev) => ({
      ...prev,
      videoUrls: [...prev.videoUrls, newVideoInput.trim()],
    }));
    setNewVideoInput("");
  };

  const handleRemoveVideo = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      videoUrls: prev.videoUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Configuration mise à jour avec succès !");
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de la sauvegarde.");
      }
    } catch (error) {
      toast.error("Erreur réseau lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm font-medium">
        <FiRefreshCw className="animate-spin mr-2 text-emerald-600" size={18} /> Chargement de la configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <FiSettings className="text-emerald-600" /> Configuration Générale du Site & Domaine
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Pilotez l'identité visuelle, les bannières carrousel, les horaires et la logistique de Plaza D'Oliviers.
          </p>
        </div>
        <button
          onClick={fetchSettings}
          type="button"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
        >
          <FiRefreshCw size={14} /> Actualiser
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Coordonnées & Domaine */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
            <FiMapPin className="text-emerald-600" /> Coordonnées du Domaine
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nom du Domaine / Boutique</label>
              <input
                type="text"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Slogan</label>
              <input
                type="text"
                name="storeTagline"
                value={settings.storeTagline}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="flex text-xs font-bold text-gray-700 mb-1  items-center gap-1">
                <FiMail size={13} className="text-gray-400" /> E-mail de contact
              </label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="flex text-xs font-bold text-gray-700 mb-1  items-center gap-1">
                <FiPhone size={13} className="text-gray-400" /> Téléphone professionnel
              </label>
              <input
                type="text"
                name="contactPhone"
                value={settings.contactPhone}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Adresse physique</label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ville</label>
              <input
                type="text"
                name="city"
                value={settings.city}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* 2. Carrousel des Bannières Publicitaires (Accueil) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FiLayers className="text-emerald-600" /> Carrousel de Bannières Publicitaires (Accueil)
            </h2>
            <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <FiUpload size={14} />
              {uploadingField === "carrousel" ? "Téléchargement..." : "Ajouter des bannières"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleBannerUpload}
                disabled={uploadingField === "carrousel"}
              />
            </label>
          </div>

          <p className="text-xs text-gray-500">
            Ces images défileront automatiquement dans le Carrousel publicitaire en haut de la page d'accueil. Vous pouvez en téléverser plusieurs à la fois.
          </p>

          {settings.heroBanners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {settings.heroBanners.map((bannerUrl, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-36 flex items-center justify-center shadow-xs">
                  <img src={bannerUrl} alt={`Bannière ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveBanner(idx)}
                      className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-full shadow-md transition cursor-pointer"
                      title="Supprimer cette bannière"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-xl bg-gray-50 text-xs text-gray-400">
              Aucune bannière publicitaire dans le carrousel. Cliquez sur "Ajouter des bannières" pour en uploader.
            </div>
          )}
        </div>

        {/* 3. Logo & Image À propos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
            <FiImage className="text-emerald-600" /> Logo & Images Complémentaires
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo */}
            <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Logo du Site</label>
                <input
                  type="text"
                  name="logoUrl"
                  value={settings.logoUrl}
                  onChange={handleChange}
                  placeholder="/images/logo.png"
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none mb-2"
                />
                {settings.logoUrl && (
                  <div className="h-16 w-full flex items-center justify-center bg-white rounded-lg border border-gray-100 p-1 mb-2">
                    <img src={settings.logoUrl} alt="Logo" className="max-h-full object-contain" />
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 w-full">
                  <FiUpload size={14} />
                  {uploadingField === "logoUrl" ? "Téléchargement..." : "Uploader un Logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "logoUrl")}
                    disabled={uploadingField === "logoUrl"}
                  />
                </label>
              </div>
            </div>

            {/* Image À propos / Domaine */}
            <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Image "À propos / Domaine"</label>
                <input
                  type="text"
                  name="aboutImageUrl"
                  value={settings.aboutImageUrl}
                  onChange={handleChange}
                  placeholder="/images/about-farm.jpg"
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none mb-2"
                />
                {settings.aboutImageUrl && (
                  <div className="h-16 w-full flex items-center justify-center bg-white rounded-lg border border-gray-100 p-1 mb-2 overflow-hidden">
                    <img src={settings.aboutImageUrl} alt="À propos" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 w-full">
                  <FiUpload size={14} />
                  {uploadingField === "aboutImageUrl" ? "Téléchargement..." : "Uploader une Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "aboutImageUrl")}
                    disabled={uploadingField === "aboutImageUrl"}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Horaires d'Ouverture & Fermeture */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
            <FiClock className="text-emerald-600" /> Horaires d'Ouverture & Fermeture
          </h2>
          <div className="space-y-3">
            {settings.openingHours.map((item, idx) => (
              <div key={item.day} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="w-28 text-xs font-bold text-gray-800">{item.day}</span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="time"
                    disabled={item.closed}
                    value={item.open}
                    onChange={(e) => handleHourChange(idx, "open", e.target.value)}
                    className="bg-white border rounded-lg px-2.5 py-1 text-xs font-semibold disabled:opacity-40"
                  />
                  <span className="text-xs text-gray-400">à</span>
                  <input
                    type="time"
                    disabled={item.closed}
                    value={item.close}
                    onChange={(e) => handleHourChange(idx, "close", e.target.value)}
                    className="bg-white border rounded-lg px-2.5 py-1 text-xs font-semibold disabled:opacity-40"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600">
                  <input
                    type="checkbox"
                    checked={item.closed}
                    onChange={(e) => handleHourChange(idx, "closed", e.target.checked)}
                    className="accent-rose-600 w-4 h-4 rounded cursor-pointer"
                  />
                  Fermé ce jour
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Seuils d'alerte de stock & Devise */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
            <FiBell className="text-emerald-600" /> Seuils d'Alerte de Stock & Devise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Seuil d'alerte stock par défaut</label>
              <input
                type="number"
                min="1"
                name="defaultMinStockAlert"
                value={settings.defaultMinStockAlert}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Devise principale</label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              >
                <option value="MAD">MAD (Dirham Marocain)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 6. Modes de Livraison & Paiement */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
            <FiTruck className="text-emerald-600" /> Modes de Livraison & Paiement
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-xs font-bold text-gray-800">Livraison à domicile</p>
                <p className="text-[11px] text-gray-500">Activer l'option de livraison</p>
              </div>
              <input
                type="checkbox"
                name="enableHomeDelivery"
                checked={settings.enableHomeDelivery}
                onChange={handleChange}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-xs font-bold text-gray-800">Retrait sur place (Click & Collect)</p>
                <p className="text-[11px] text-gray-500">Retrait au domaine</p>
              </div>
              <input
                type="checkbox"
                name="enablePickup"
                checked={settings.enablePickup}
                onChange={handleChange}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Frais Standard (MAD)</label>
              <input
                type="number"
                step="0.01"
                name="standardShippingFee"
                value={settings.standardShippingFee}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Frais Express (MAD)</label>
              <input
                type="number"
                step="0.01"
                name="expressShippingFee"
                value={settings.expressShippingFee}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none font-semibold"
              />
            </div>
          </div>

          <div className="pt-3 border-t">
            <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1">
              <FiCreditCard className="text-emerald-600" /> Modes de Paiement activés :
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  name="paymentCashOnDelivery"
                  checked={settings.paymentCashOnDelivery}
                  onChange={handleChange}
                  className="accent-emerald-600 w-4 h-4"
                />
                Paiement à la livraison
              </label>
              <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  name="paymentBankTransfer"
                  checked={settings.paymentBankTransfer}
                  onChange={handleChange}
                  className="accent-emerald-600 w-4 h-4"
                />
                Virement bancaire
              </label>
              <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  name="paymentCashPlus"
                  checked={settings.paymentCashPlus}
                  onChange={handleChange}
                  className="accent-emerald-600 w-4 h-4"
                />
                Wafacash / CashPlus
              </label>
              <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  name="paymentCreditCard"
                  checked={settings.paymentCreditCard}
                  onChange={handleChange}
                  className="accent-emerald-600 w-4 h-4"
                />
                Carte Bancaire en ligne
              </label>
            </div>
          </div>
        </div>

        {/* 7. Vidéos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
            <FiVideo className="text-emerald-600" /> Vidéos Promotionnelles / Présentation
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={newVideoInput}
              onChange={(e) => setNewVideoInput(e.target.value)}
              placeholder="Coller l'URL de la vidéo (YouTube, etc.)..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddVideo}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <FiPlus size={16} /> Ajouter
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {settings.videoUrls.map((url, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs font-mono text-gray-700 truncate">{url}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveVideo(index)}
                  className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton de soumission global */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FiSave size={18} /> {submitting ? "Enregistrement..." : "Enregistrer toute la configuration"}
          </button>
        </div>

      </form>
    </div>
  );
}

