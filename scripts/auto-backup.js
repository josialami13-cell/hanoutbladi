const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const ExcelJS = require('exceljs');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const prisma = new PrismaClient();

// Fonction générique pour exporter TOUS les champs d'un modèle Prisma dans un onglet Excel
function addFullTableSheet(workbook, sheetName, data) {
  if (!data || data.length === 0) {
    const sheet = workbook.addWorksheet(sheetName);
    sheet.addRow(["Aucune donnée disponible"]);
    return;
  }

  const sheet = workbook.addWorksheet(sheetName);

  // 1. Extraire TOUTES les clés (colonnes) du premier objet
  const columns = Object.keys(data[0]).map((key) => ({
    header: key,
    key: key,
    width: Math.max(key.length + 5, 18),
  }));

  sheet.columns = columns;

  // Style de l'en-tête (Vert Émeraude)
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "047857" },
  };

  // 2. Ajouter toutes les lignes de données (avec conversion des objets/JSON en texte)
  data.forEach((row) => {
    const formattedRow = {};
    Object.keys(row).forEach((key) => {
      const val = row[key];
      if (val instanceof Date) {
        formattedRow[key] = val.toISOString();
      } else if (typeof val === "object" && val !== null) {
        formattedRow[key] = JSON.stringify(val); // Convertit les champs JSON / objets en texte
      } else {
        formattedRow[key] = val ?? "";
      }
    });
    sheet.addRow(formattedRow);
  });
}

async function runNightlyBackups() {
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const dateStr = new Date().toISOString().split('T')[0];
  console.log(`[${new Date().toISOString()}] Début du FULL BACKUP (Dump SQL + Excel total)...`);

  try {
    // ==========================================
    // 1. DUMP SQL COMPLET (Restauration Technique)
    // ==========================================
    const dbUrl = process.env.DATABASE_URL || '';
    const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

    if (match) {
      const [, dbUser, dbPass, dbHost, dbPort, dbName] = match;
      const sqlFileName = `HanoutBladi_FULL_Backup_${dateStr}.sql`;
      const sqlFilePath = path.join(backupDir, sqlFileName);

      const command = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p"${dbPass}" --all-tablespaces --add-drop-table ${dbName} > "${sqlFilePath}"`;

      try {
        await execAsync(command);
        console.log(`✅ Dump SQL complet généré : ${sqlFileName}`);
      } catch (err) {
        console.error("⚠️ Échec mysqldump direct :", err.message);
      }
    }

    // ==========================================
    // 2. EXCEL TOTAL (Toutes les tables & tous les champs)
    // ==========================================
    const workbook = new ExcelJS.Workbook();

    // Exportation dynamique de CHAQUE table de la base de données
    const products = await prisma.product.findMany();
    addFullTableSheet(workbook, "Produits", products);

    const categories = await prisma.category.findMany();
    addFullTableSheet(workbook, "Catégories", categories);

    const orders = await prisma.order.findMany();
    addFullTableSheet(workbook, "Commandes", orders);

    const orderItems = await prisma.orderItem?.findMany().catch(() => []);
    if (orderItems.length) addFullTableSheet(workbook, "Articles Commandes", orderItems);

    const clients = await prisma.client.findMany();
    addFullTableSheet(workbook, "Clients", clients);

    const commercials = await prisma.commercial.findMany();
    addFullTableSheet(workbook, "Commerciaux", commercials);

    const deliveryMen = await prisma.deliveryMan.findMany();
    addFullTableSheet(workbook, "Livreurs", deliveryMen);

    const suppliers = await prisma.supplier.findMany();
    addFullTableSheet(workbook, "Fournisseurs", suppliers);

    const invoices = await prisma.invoice.findMany();
    addFullTableSheet(workbook, "Factures", invoices);

    const banners = await prisma.banner?.findMany().catch(() => []);
    if (banners.length) addFullTableSheet(workbook, "Bannières", banners);

    // Écriture du fichier Excel final
    const excelFileName = `HanoutBladi_FULL_Backup_${dateStr}.xlsx`;
    const excelFilePath = path.join(backupDir, excelFileName);
    await workbook.xlsx.writeFile(excelFilePath);
    console.log(`✅ Fichier Excel total généré : ${excelFileName}`);

  } catch (error) {
    console.error("❌ Erreur lors de la sauvegarde nocturne :", error);
  } finally {
    await prisma.$disconnect();
    console.log("🏁 Sauvegarde totale terminée avec succès.");
  }
}

runNightlyBackups();