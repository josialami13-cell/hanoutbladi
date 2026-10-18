"use client";

import { useState } from "react";

export default function BackupsAdminPage() {
  const [loading, setLoading] = useState(false);

  const handleDownloadBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/backup-excel");
      if (!response.ok) throw new Error("Erreur lors du téléchargement");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HanoutBladi_FULL_Backup_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      alert("حدث خطأ أثناء تحميل النسخة الاحتياطية!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl max-w-4xl mx-auto">
      {/* Header الصفحة */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">النسخ الاحتياطي للنظام (Backup Excel)</h1>
          <p className="text-sm text-slate-500 mt-1">
            استخراج نسخة شاملة تضم كاع البيانات والجداول الموجودة في قاعدة البيانات بصيغة Excel.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 self-start md:self-auto">
          ● النظام آمن 100%
        </span>
      </div>

      {/* Carte تحميل النسخة */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl text-2xl">
            📊
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">تحميل نسخة شاملة وفورية (Full Data Export)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              عند الضغط على الزر، سينشئ النظام ملف Excel يضم جميع الجداول (الطلبيات، المنتجات، الزبناء، الكميرسيال، الفواتير، الموزعين) بكل حقولها للتأمين الشامل.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleDownloadBackup}
            disabled={loading}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <span>📥</span>
            <span>{loading ? "جاري تجهيز وتجميع البيانات..." : "تحميل ملف Excel الآن"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}