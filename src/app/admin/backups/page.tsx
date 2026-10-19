"use client";

import { useState, useEffect } from "react";
import { FiDownload, FiRefreshCw, FiDatabase, FiFileText, FiCheckCircle } from "react-icons/fi";

interface BackupFile {
  fileName: string;
  type: string;
  size: string;
  createdAt: string;
}

export default function BackupsAdminPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/backups");
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleGenerate = async (format: "sql" | "excel") => {
    setGenerating(format);
    try {
      const res = await fetch("/api/admin/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });
      if (res.ok) {
        loadBackups();
        alert(`Sauvegarde ${format.toUpperCase()} générée avec succès !`);
      } else {
        alert("Erreur lors de la génération.");
      }
    } catch (error) {
      alert("Erreur réseau.");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Centre de Sauvegarde (SQL & Excel)</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gérez vos sauvegardes techniques (SQL pour restauration) et analytiques (Excel pour consultation).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleGenerate("sql")}
            disabled={generating !== null}
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-4 py-2.5 rounded-xl transition text-xs flex items-center gap-2"
          >
            <FiDatabase /> {generating === "sql" ? "Génération SQL..." : "Créer Dump SQL"}
          </button>
          <button
            onClick={() => handleGenerate("excel")}
            disabled={generating !== null}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-4 py-2.5 rounded-xl transition text-xs flex items-center gap-2"
          >
            <FiFileText /> {generating === "excel" ? "Génération Excel..." : "Créer Excel"}
          </button>
        </div>
      </div>

      {/* Liste des fichiers disponibles */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FiCheckCircle className="text-emerald-600" /> Historique des Fichiers de Sauvegarde
          </h2>
          <button onClick={loadBackups} className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1">
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Actualiser
          </button>
        </div>

        {backups.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">Aucune sauvegarde trouvée.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {backups.map((file, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs sm:text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800">{file.fileName}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${file.fileName.endsWith('.sql') ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {file.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Créé le {new Date(file.createdAt).toLocaleString("fr-FR")} • {file.size}
                  </p>
                </div>
                <a
                  href={`/backups/${file.fileName}`}
                  download
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 font-semibold text-xs transition"
                >
                  <FiDownload /> Télécharger
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}