import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Hanout Bladi System";
    workbook.created = new Date();

    // قائمة بجميع الجداول الموجودة في قاعدة البيانات
    const modelsToExport = [
      { name: "Order", title: "Commandes" },
      { name: "Product", title: "Produits" },
      { name: "Client", title: "Clients" },
      { name: "Commercial", title: "Commerciaux" },
      { name: "Company", title: "Societes_Facturation" },
      { name: "Invoice", title: "Factures" },
      { name: "User", title: "Utilisateurs_Admin" },
      { name: "Delivery", title: "Livraisons" },
      { name: "Supplier", title: "Fournisseurs" },
      { name: "Purchase", title: "Achats" },
    ];

    for (const item of modelsToExport) {
      const prismaModel = (prisma as any)[item.name.toLowerCase()];

      if (prismaModel && typeof prismaModel.findMany === "function") {
        // جلب جميع التسجيلات بدون استثناء
        const records = await prismaModel.findMany();

        if (records.length > 0) {
          const worksheet = workbook.addWorksheet(item.title);

          // 1. استخراج "جميع" أسماء الحقول الموجودة في الطابلة أوتوماتيكياً
          const allKeys = Object.keys(records[0]);

          worksheet.columns = allKeys.map((key) => ({
            header: key, // اسم الحقل كما هو في قاعدة البيانات
            key: key,
            width: 20,
          }));

          // 2. تعبئة القيم لجميع الحقول
          records.forEach((record: any) => {
            const rowData: Record<string, any> = {};

            allKeys.forEach((key) => {
              const value = record[key];

              // تحويل الأجسام والـ Dates لـ Format مقروء في Excel
              if (value instanceof Date) {
                rowData[key] = value.toISOString();
              } else if (typeof value === "object" && value !== null) {
                rowData[key] = JSON.stringify(value); // للحقول من نوع Json أو Array
              } else {
                rowData[key] = value ?? "";
              }
            });

            worksheet.addRow(rowData);
          });
        }
      }
    }

    // توليد ملف الـ Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `HanoutBladi_FULL_Backup_${dateStr}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: any) {
    console.error("Erreur generation full backup excel:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}