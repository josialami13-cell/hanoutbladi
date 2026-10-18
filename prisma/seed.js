// =============================================================
// SEED INTELLIGENT ET NON DESTRUCTIF (Utilise upsert)
// =============================================================

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("👤 Gestion sécurisée du compte administrateur...");
  const adminEmail = "josialami13@gmail.com";
  const adminPassword = "hanout@bladi";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: "ADMIN",
      name: "Administrateur",
    },
    create: {
      email: adminEmail,
      name: "Administrateur",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin configuré avec succès : ${admin.email}`);

  console.log("🌱 Synchronisation intelligente des départements, catégories et produits...");

  // Données structurées du catalogue
  const departmentsData = [
    {
      name_fr: "Alimentation & Épicerie",
      name_ar: "مواد غذائية وبقالة",
      slug: "food",
      description_fr: "Produits alimentaires, huiles d'olive du domaine et gourmandises locales",
      description_ar: "منتجات غذائية، زيت زيتون الضيعة وحلويات محلية",
      categories: [
        {
          name_fr: "Huiles d’Olive du Domaine",
          name_ar: "زيوت الزيتون من الضيعة",
          slug: "huiles-olive-domaine",
          description_fr: "Nos récoltes d'huile d'olive vierge extra en différents formats",
          description_ar: "محاصيلنا من زيت الزيتون البكر الممتاز بمختلف الأحجام",
          products: [
            {
              name_fr: "Huile d’Olive Vierge Extra 1L",
              name_ar: "زيت زيتون بكر ممتازة 1 لتر",
              slug: "huile-olive-1l",
              description_fr: "Huile d’olive de première pression à froid.",
              description_ar: "زيت زيتون طبيعية معصورة على البارد.",
              price: 85.0,
              lastPurchasePrice: 60.0,
              stock: 45,
              isActive: true,
              isFeatured: false,
              unit: "Bouteille",
              images: [],
            },
            {
              name_fr: "Bidon Huile d’Olive Vierge Extra 2L",
              name_ar: "عبوة زيت زيتون بكر ممتازة 2 لتر",
              slug: "huile-olive-2l",
              description_fr: "Format familial pratique pour stocker l'huile d'olive du domaine.",
              description_ar: "عبوة عائلية عملية لتخزين زيت الزيتون الأصلي.",
              price: 165.0,
              lastPurchasePrice: 120.0,
              stock: 30,
              isActive: true,
              isFeatured: true,
              unit: "Bidon",
              images: [],
            },
            {
              name_fr: "Bidon Huile d’Olive Vierge Extra 5L",
              name_ar: "عبوة زيت زيتون بكر ممتازة 5 لتر",
              slug: "huile-olive-5l",
              description_fr: "Grand bidon économique d'huile d'olive pure récoltée à Settat.",
              description_ar: "عبوة اقتصادية كبرى من زيت الزيتون الصافي المنتج بسطات.",
              price: 390.0,
              lastPurchasePrice: 290.0,
              stock: 25,
              isActive: true,
              isFeatured: true,
              unit: "Bidon",
              images: [],
            },
          ],
        },
        {
          name_fr: "Miel & Douceurs",
          name_ar: "عسل وحلويات",
          slug: "miel-douceurs",
          description_fr: "Miel pur et préparations artisanales sucrées",
          description_ar: "عسل حر ومستحضرات حلويات تقليدية",
          products: [
            {
              name_fr: "Miel d’Eucalyptus 500g",
              name_ar: "عسل الإوكاليبتوس 500 غرام",
              slug: "miel-eucalyptus-500g",
              description_fr: "Miel pur récolté de manière artisanale.",
              description_ar: "عسل حر طبيعي مستخرج بطريقة تقليدية.",
              price: 120.0,
              lastPurchasePrice: 85.0,
              stock: 30,
              isActive: true,
              isFeatured: false,
              unit: "Pot",
              images: [],
            },
            {
              name_fr: "Amlou Beldi aux Amandes 250g",
              name_ar: "أملو بلدي باللوز 250 غرام",
              slug: "amlou-beldi-250g",
              description_fr: "Pâte à tartiner traditionnelle amandes et huile d’argan.",
              description_ar: "وصفة تقليدية باللوز وزيت أركان.",
              price: 95.0,
              lastPurchasePrice: 65.0,
              stock: 20,
              isActive: true,
              isFeatured: true,
              unit: "Pot",
              images: [],
            },
          ],
        },
      ],
    },
    {
      name_fr: "Cosmétiques & Soins",
      name_ar: "مستحضرات التجميل والعناية",
      slug: "cosmetiques",
      description_fr: "Produits de beauté naturels à base d'huile d'olive, d'argan et de plantes",
      description_ar: "منتجات التجميل الطبيعية المستخلصة من زيت الزيتون وأركان والأعشاب",
      categories: [
        {
          name_fr: "Soins Visage & Corps",
          name_ar: "عناية الوجه والجسم",
          slug: "soins-visage-corps",
          description_fr: "Huiles de soin pures et élixirs naturels",
          description_ar: "زيوت العناية النقية والزيوت الأساسية الطبيعية",
          products: [
            {
              name_fr: "Huile d’Argan Cosmétique Bio 100ml",
              name_ar: "زيت أركان للتجميل عضوي 100 مل",
              slug: "huile-argan-bio-100ml",
              description_fr: "Huile d'argan pure pressée à froid pour la peau et les cheveux.",
              description_ar: "زيت أركان نقي معصور على البارد للبشرة والشعر.",
              price: 140.0,
              lastPurchasePrice: 90.0,
              stock: 25,
              isActive: true,
              isFeatured: true,
              unit: "Flacon",
              images: [],
            },
          ],
        },
        {
          name_fr: "Savons & Gommages",
          name_ar: "صابون ومقشرات",
          slug: "savons-gommages",
          description_fr: "Savon noir beldi et savons naturels à l'huile d'olive",
          description_ar: "الصابون البلدي الأسود والصابون الطبيعي بزيت الزيتون",
          products: [
            {
              name_fr: "Savon Noir Beldi à l’Eucalyptus 200g",
              name_ar: "الصابون البلدي الأسود بالأوكاليبتوس 200 غرام",
              slug: "savon-noir-eucalyptus",
              description_fr: "Savon traditionnel pour un gommage profond au hammam.",
              description_ar: "صابون تقليدي لتنظيف عميق وتقشير البشرة.",
              price: 50.0,
              lastPurchasePrice: 30.0,
              stock: 40,
              isActive: true,
              isFeatured: false,
              unit: "Pot",
              images: [],
            },
          ],
        },
      ],
    },
    {
      name_fr: "Plantes & Infusions",
      name_ar: "أعشاب وشاي",
      slug: "plantes-infusions",
      description_fr: "Plantes médicinales cueillies dans la nature et thés relaxants",
      description_ar: "أعشاب طبية برية وشاي مهدئ ومنعش",
      categories: [
        {
          name_fr: "Thés & Infusions",
          name_ar: "شاي ومشروبات عشبية",
          slug: "thes-infusions",
          description_fr: "Mélanges de plantes pour infusion et bien-être",
          description_ar: "خلطات أعشاب للاسترخاء والصحة العامة",
          products: [
            {
              name_fr: "Verveine Séchée en Bouquet 100g",
              name_ar: "لويزة مجففة باقة 100 غرام",
              slug: "verveine-sechee-100g",
              description_fr: "Verveine odorante séchée naturellement aux propriétés apaisantes.",
              description_ar: "أوراق اللويزة المجففة طبيعياً بخصائص مهدئة.",
              price: 30.0,
              lastPurchasePrice: 15.0,
              stock: 50,
              isActive: true,
              isFeatured: false,
              unit: "Bouquet",
              images: [],
            },
          ],
        },
      ],
    },
    {
      name_fr: "Épices & Condiments",
      name_ar: "توابل ومخللات",
      slug: "epices-condiments",
      description_fr: "Épices authentiques et condiments artisanaux de terroir",
      description_ar: "توابل أصيلة ومخللات محلية تقليدية",
      categories: [
        {
          name_fr: "Épices Traditionnelles",
          name_ar: "توابل تقليدية",
          slug: "epices-traditionnelles",
          description_fr: "Cumin, curcuma et mélanges d'épices moulus",
          description_ar: "كمون، كركم وتوابل مطحونة بعناية",
          products: [
            {
              name_fr: "Cumin Beldi en Poudre 150g",
              name_ar: "كمون بلدي مطحون 150 غرام",
              slug: "cumin-beldi-150g",
              description_fr: "Cumin de qualité supérieure au parfum intense.",
              description_ar: "كمون بلدي ممتاز برائحة عطرة وقوية.",
              price: 40.0,
              lastPurchasePrice: 22.0,
              stock: 35,
              isActive: true,
              isFeatured: false,
              unit: "Sachet",
              images: [],
            },
          ],
        },
        {
          name_fr: "Condiments & Harissa",
          name_ar: "مخللات وهريسة",
          slug: "condiments-harissa",
          description_fr: "Harissa beldi artisanale et olives de table",
          description_ar: "هريسة بلدية تقليدية وزيتون مخلل",
          products: [
            {
              name_fr: "Harissa Beldi Maison 200g",
              name_ar: "هريسة بلدية منزلية 200 غرام",
              slug: "harissa-beldi-200g",
              description_fr: "Pâte de piments rouges traditionnels aux épices et huile d'olive.",
              description_ar: "معجون الفلفل الحار التقليدي بالتوابل وزيت الزيتون.",
              price: 35.0,
              lastPurchasePrice: 18.0,
              stock: 30,
              isActive: true,
              isFeatured: true,
              unit: "Pot",
              images: [],
            },
          ],
        },
      ],
    },
    {
      name_fr: "Vêtements",
      name_ar: "ملابس",
      slug: "vetements",
      description_fr: "Vêtements traditionnels et confections artisanales",
      description_ar: "ملابس تقليدية وخياطة رفيعة",
      categories: [
        {
          name_fr: "Gandouras & Djellabas",
          name_ar: "قنادر وجلابيب",
          slug: "gandouras-djellabas",
          description_fr: "Tenues traditionnelles pour hommes et femmes",
          description_ar: "ألبسة تقليدية للرجال والنساء",
          products: [
            {
              name_fr: "Gandoura Homme en Coton Sousdi",
              name_ar: "قندورة رجالية من القطن السوسي",
              slug: "gandoura-homme-coton",
              description_fr: "Gandoura légère et élégante faite à la main.",
              description_ar: "قندورة خفيفة وأنيقة مصنوعة يدوياً.",
              price: 250.0,
              lastPurchasePrice: 170.0,
              stock: 15,
              isActive: true,
              isFeatured: true,
              unit: "Pièce",
              images: [],
            },
          ],
        },
      ],
    },
    {
      name_fr: "Poterie",
      name_ar: "فخار",
      slug: "poterie",
      description_fr: "Poteries décoratives, tajines et arts de la table",
      description_ar: "أواني فخارية وديكورات تقليدية",
      categories: [
        {
          name_fr: "Tajines & Plats",
          name_ar: "طواجين وأطباق",
          slug: "tajines-plats",
          description_fr: "Plats et tajines en terre cuite pour la cuisson",
          description_ar: "أطباق وطواجين من الطين للطهي والتقديم",
          products: [
            {
              name_fr: "Tajine de Cuisson en Terre Cuite 30cm",
              name_ar: "طاجين الطهي من الطين 30 سم",
              slug: "tajine-cuisson-30cm",
              description_fr: "Tajine traditionnel non verni résistant au feu.",
              description_ar: "طاجين تقليدي للطهي مقاوم للحرارة.",
              price: 75.0,
              lastPurchasePrice: 45.0,
              stock: 20,
              isActive: true,
              isFeatured: true,
              unit: "Pièce",
              images: [],
            },
          ],
        },
      ],
    },
  ];

  for (const deptData of departmentsData) {
    const department = await prisma.department.upsert({
      where: { slug: deptData.slug },
      update: {
        name_fr: deptData.name_fr,
        name_ar: deptData.name_ar,
        description_fr: deptData.description_fr,
        description_ar: deptData.description_ar,
      },
      create: {
        name_fr: deptData.name_fr,
        name_ar: deptData.name_ar,
        slug: deptData.slug,
        description_fr: deptData.description_fr,
        description_ar: deptData.description_ar,
      },
    });

    for (const catData of deptData.categories) {
      const category = await prisma.category.upsert({
        where: { slug: catData.slug },
        update: {
          name_fr: catData.name_fr,
          name_ar: catData.name_ar,
          description_fr: catData.description_fr,
          description_ar: catData.description_ar,
          departmentId: department.id,
        },
        create: {
          name_fr: catData.name_fr,
          name_ar: catData.name_ar,
          slug: catData.slug,
          description_fr: catData.description_fr,
          description_ar: catData.description_ar,
          departmentId: department.id,
        },
      });

      for (const prodData of catData.products) {
        await prisma.product.upsert({
          where: { slug: prodData.slug },
          update: {
            name_fr: prodData.name_fr,
            name_ar: prodData.name_ar,
            description_fr: prodData.description_fr,
            description_ar: prodData.description_ar,
            price: prodData.price,
            lastPurchasePrice: prodData.lastPurchasePrice,
            stock: prodData.stock,
            isActive: prodData.isActive,
            isFeatured: prodData.isFeatured,
            unit: prodData.unit,
            images: prodData.images,
            categoryId: category.id,
          },
          create: {
            name_fr: prodData.name_fr,
            name_ar: prodData.name_ar,
            slug: prodData.slug,
            description_fr: prodData.description_fr,
            description_ar: prodData.description_ar,
            price: prodData.price,
            lastPurchasePrice: prodData.lastPurchasePrice,
            stock: prodData.stock,
            isActive: prodData.isActive,
            isFeatured: prodData.isFeatured,
            unit: prodData.unit,
            images: prodData.images,
            categoryId: category.id,
          },
        });
      }
    }
  }

  console.log("✅ Seed intelligent exécuté avec succès : Données synchronisées sans perte !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });