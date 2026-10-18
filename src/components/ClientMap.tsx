"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Icônes personnalisées selon le type de client
const icons = {
  SOCIETE: L.divIcon({
    className: "custom-pin",
    html: `<div style="background-color: #3b82f6; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4);" title="Société"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  }),
  GROSSISTE: L.divIcon({
    className: "custom-pin",
    html: `<div style="background-color: #eab308; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4);" title="Grossiste"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  }),
  PARTICULIER: L.divIcon({
    className: "custom-pin",
    html: `<div style="background-color: #ef4444; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4);" title="Client Local"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  }),
};

interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  clientType: "SOCIETE" | "GROSSISTE" | "PARTICULIER";
  latitude: number;
  longitude: number;
}

export default function ClientMap() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((res) => res.json())
      .then((data) => {
        const validClients = data.filter(
          (c: any) => c.latitude !== null && c.longitude !== null
        );
        setClients(validClients);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement clients:", err);
        setLoading(false);
      });
  }, []);

  const defaultCenter: [number, number] = [32.0, -6.0]; // Centre Maroc

  if (loading) {
    return <div className="p-6 text-center text-stone-500">Chargement de la carte géographique...</div>;
  }

  return (
    <div className="w-full h-[650px] rounded-xl overflow-hidden shadow-sm border border-stone-200 relative">
      {/* Légende des types de clients */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur p-3 rounded-lg shadow-md border border-stone-200 text-xs space-y-1.5">
        <div className="font-bold text-stone-700 mb-1">Légende :</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Société</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Grossiste</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Client Local</div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={6}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {clients.map((client) => {
          const markerIcon = icons[client.clientType] || icons.PARTICULIER;
          return (
            <Marker
              key={client.id}
              position={[client.latitude, client.longitude]}
              icon={markerIcon}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold mb-1 bg-stone-100 text-stone-700">
                    {client.clientType === "SOCIETE" ? "🏢 Société" : client.clientType === "GROSSISTE" ? "📦 Grossiste" : "🏡 Local"}
                  </span>
                  <h3 className="font-bold text-stone-900 text-sm mb-0.5">{client.name}</h3>
                  <p className="text-xs text-stone-600 mb-1">
                    {client.address ? `${client.address}, ` : ""} {client.city || "Maroc"}
                  </p>
                  {client.phone && (
                    <p className="text-xs text-stone-600 mb-2 font-medium">📞 {client.phone}</p>
                  )}
                  
                  {/* Itinéraire Google Maps */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${client.latitude},${client.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center bg-[#3B4D3C] text-white text-xs px-3 py-2 rounded font-medium hover:bg-[#2d3c2e] transition shadow-sm"
                  >
                    🧭 Itinéraire Google Maps
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}