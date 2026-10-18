const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "josialami13@gmail.com";
  const password = "hanout@bladi";

  // Hachage sécurisé du mot de passe avec bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insertion ou mise à jour de l'utilisateur dans Neon DB
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      email,
      name: "Administrateur",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("--------------------------------------------------");
  console.log("✅ COMPTE ADMIN CRÉÉ / MIS À JOUR AVEC SUCCÈS !");
  console.log("Email :", user.email);
  console.log("Mot de passe :", password);
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors de la création de l'admin :", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });