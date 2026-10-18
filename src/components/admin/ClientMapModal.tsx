"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FiX, FiPhone, FiMessageSquare } from "react-icons/fi";
import { ClientData } from "@/app/admin/clients/page";

// أيقونة النقطة الحمراء (Red Marker Pin)
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Props {
  clients: ClientData[];
  onClose: () => void;
}

export default function ClientMapModal({ clients, onClose }: Props) {
  // تصفية الكليونات التي تملك إحداثيات GPS
  const localizedClients = clients.filter((c) => c.latitude && c.longitude);

  // الإحداثيات المرجعية للمغرب (سطات / وسط المغرب)
  const defaultCenter: [number, number] = [31.7917, -7.0926];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* En-tête الخريطة */}
        <div className="p-4 bg-[#2C3E2D] text-white flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold">Carte Géographique des Clients</h2>
            <p className="text-xs text-stone-300">
              {localizedClients.length} client(s) géolocalisé(s) sur la carte.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-full">
            <FiX size={20} />
          </button>
        </div>

        {/* حاوية الخريطة */}
        <div className="flex-1 w-full h-full relative">
          <MapContainer center={defaultCenter} zoom={6} scrollWheelZoom={true} className="w-full h-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {localizedClients.map((client) => (
              <Marker
                key={client.id}
                position={[client.latitude!, client.longitude!]}
                icon={redIcon}
              >
                <Popup>
                  <div className="p-1 space-y-2 text-xs">
                    <p className="font-bold text-stone-900 text-sm">{client.name}</p>
                    <p className="text-stone-600 font-mono flex items-center gap-1">
                      <FiPhone size={11} /> {client.phone}
                    </p>
                    <p className="text-stone-500">{client.city} - {client.address || "Pas d'adresse"}</p>
                    <a
                      href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 bg-emerald-700 text-white px-3 py-1 rounded-full font-bold text-[10px]"
                    >
                      <FiMessageSquare size={11} /> Contacter WhatsApp
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

      </div>
    </div>
  );
}