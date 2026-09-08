import { PrismaClient, Role, OrderStatus, PaymentStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Praz Space Cafe Database Seed...");

  // 1. Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("✓ Existing database records cleared.");

  // 2. Create Users (Owner, Admin/Manager, Cashiers)
  const passwordHash = await bcrypt.hash("password123", 10);

  const owner = await prisma.user.create({
    data: {
      name: "Prasetyo (Owner)",
      email: "owner@prazspace.cafe",
      passwordHash,
      role: Role.OWNER,
      isActive: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Rina Kartika (Manager)",
      email: "admin@prazspace.cafe",
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const cashier1 = await prisma.user.create({
    data: {
      name: "Budi Santoso (Kasir Shift 1)",
      email: "cashier@prazspace.cafe",
      passwordHash,
      role: Role.CASHIER,
      isActive: true,
    },
  });

  const cashier2 = await prisma.user.create({
    data: {
      name: "Siti Rahma (Kasir Shift 2)",
      email: "cashier2@prazspace.cafe",
      passwordHash,
      role: Role.CASHIER,
      isActive: true,
    },
  });

  console.log("✓ Seeded 4 Users (Owner, Admin, 2 Cashiers).");

  // 3. Create Categories
  const catCoffee = await prisma.category.create({
    data: {
      name: "Coffee",
      slug: "coffee",
      isActive: true,
    },
  });

  const catNonCoffee = await prisma.category.create({
    data: {
      name: "Non-Coffee",
      slug: "non-coffee",
      isActive: true,
    },
  });

  const catFood = await prisma.category.create({
    data: {
      name: "Food & Snacks",
      slug: "food",
      isActive: true,
    },
  });

  const catDessert = await prisma.category.create({
    data: {
      name: "Dessert & Pastry",
      slug: "dessert",
      isActive: true,
    },
  });

  const catSignature = await prisma.category.create({
    data: {
      name: "Signature Specials",
      slug: "signature",
      isActive: true,
    },
  });

  console.log("✓ Seeded 5 Categories.");

  // 4. Create Products
  const productsData = [
    // Coffee
    {
      name: "Espresso Single Origin",
      slug: "espresso-single-origin",
      description: "Ekstraksi kopi murni dengan aroma pekat dan crema tebal karamel.",
      price: 18000,
      imageUrl: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&auto=format&fit=crop&q=80",
      categoryId: catCoffee.id,
      isActive: true,
    },
    {
      name: "Americano Classic",
      slug: "americano-classic",
      description: "Espresso ganda dipadukan dengan air panas, profil rasa bersih dan segar.",
      price: 22000,
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
      categoryId: catCoffee.id,
      isActive: true,
    },
    {
      name: "Cafe Latte",
      slug: "cafe-latte",
      description: "Perpaduan espresso kaya rasa dengan steamed milk lembut dan microfoam halus.",
      price: 28000,
      imageUrl: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80",
      categoryId: catCoffee.id,
      isActive: true,
    },
    {
      name: "Cappuccino Italiano",
      slug: "cappuccino-italiano",
      description: "Keseimbangan sempurna antara espresso, steamed milk, dan busa tebal berhias bubuk cokelat.",
      price: 28000,
      imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80",
      categoryId: catCoffee.id,
      isActive: true,
    },
    {
      name: "Caramel Macchiato",
      slug: "caramel-macchiato",
      description: "Susu segar dengan sirup vanila, diberi lapisan espresso dan siraman saus karamel.",
      price: 32000,
      imageUrl: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=80",
      categoryId: catCoffee.id,
      isActive: true,
    },

    // Signature
    {
      name: "Praz Aren Signature Latte",
      slug: "praz-aren-signature-latte",
      description: "Menu favorit khas Praz Space: Espresso, susu sapi segar, dan gula aren organik premium.",
      price: 26000,
      imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80",
      categoryId: catSignature.id,
      isActive: true,
    },
    {
      name: "Sea Salt Pistachio Cloud",
      slug: "sea-salt-pistachio-cloud",
      description: "Kopi susu dingin dengan krim pistachio gurih dan taburan sea salt kristal.",
      price: 35000,
      imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=80",
      categoryId: catSignature.id,
      isActive: true,
    },

    // Non-Coffee
    {
      name: "Ceremonial Uji Matcha Latte",
      slug: "ceremonial-uji-matcha-latte",
      description: "Bubuk matcha murni asal Uji, Kyoto diseduh tradisional dengan steamed milk.",
      price: 30000,
      imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
      categoryId: catNonCoffee.id,
      isActive: true,
    },
    {
      name: "Artisan Dark Chocolate",
      slug: "artisan-dark-chocolate",
      description: "Cokelat hitam 70% asal Jawa Barat dengan susu segar dan taburan serpihan kakao.",
      price: 28000,
      imageUrl: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&auto=format&fit=crop&q=80",
      categoryId: catNonCoffee.id,
      isActive: true,
    },
    {
      name: "Fresh Lemon Iced Tea",
      slug: "fresh-lemon-iced-tea",
      description: "Teh hitam aromatik berpadu perasan lemon segar dan daun mint.",
      price: 20000,
      imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80",
      categoryId: catNonCoffee.id,
      isActive: true,
    },

    // Food & Snacks
    {
      name: "French Butter Croissant",
      slug: "french-butter-croissant",
      description: "Pastry renyah berlapis dengan mentega murni Prancis, gurih dan harum.",
      price: 24000,
      imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80",
      categoryId: catFood.id,
      isActive: true,
    },
    {
      name: "Truffle Parmesan French Fries",
      slug: "truffle-parmesan-french-fries",
      description: "Kentang goreng renyah dibalut minyak truffle putih, keju parmesan, dan peterseli.",
      price: 26000,
      imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
      categoryId: catFood.id,
      isActive: true,
    },
    {
      name: "Crispy Chicken Brioche Sandwich",
      slug: "crispy-chicken-brioche-sandwich",
      description: "Dada ayam katsu renyah, coleslaw segar, dan saus mayo jepang dalam roti brioche panggang.",
      price: 38000,
      imageUrl: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&auto=format&fit=crop&q=80",
      categoryId: catFood.id,
      isActive: true,
    },

    // Dessert
    {
      name: "Basque Burnt Cheesecake",
      slug: "basque-burnt-cheesecake",
      description: "Kue keju panggang dengan kerak karamel khas dan tekstur tengah yang lembut meleleh.",
      price: 34000,
      imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80",
      categoryId: catDessert.id,
      isActive: true,
    },
    {
      name: "Sea Salt Fudgy Brownie",
      slug: "sea-salt-fudgy-brownie",
      description: "Brownies cokelat padat fudgy dengan taburan sea salt flakes di atasnya.",
      price: 22000,
      imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
      categoryId: catDessert.id,
      isActive: true,
    },

    // Additional Coffee
    {
      name: "Vanilla Sweet Cream Cold Brew",
      slug: "vanilla-sweet-cream-cold-brew",
      description: "Cold brew kopi artisan dengan sirup vanila madagascar dan float krim manis lembut.",
      price: 30000,
      imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80",
      categoryId: catCoffee.id,
      isActive: true,
    },
    {
      name: "Flat White Velvet",
      slug: "flat-white-velvet",
      description: "Ristretto ganda pekat dipadukan dengan microfoam steamed milk sehalus sutra.",
      price: 28000,
      imageUrl: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80",
      categoryId: catCoffee.id,
      isActive: true,
    },
    {
      name: "Mocha Choco Espresso",
      slug: "mocha-choco-espresso",
      description: "Paduan espresso kaya rasa dengan dark cocoa ganache dan susu segar gurih.",
      price: 32000,
      imageUrl: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=600&auto=format&fit=crop&q=80",
      categoryId: catCoffee.id,
      isActive: true,
    },
    {
      name: "Affogato al Caffe",
      slug: "affogato-al-caffe",
      description: "Satu scoop gelato vanila creamy disiram espresso panas single origin.",
      price: 25000,
      imageUrl: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=600&auto=format&fit=crop&q=80",
      categoryId: catCoffee.id,
      isActive: true,
    },

    // Additional Signature Specials
    {
      name: "Butterscotch Cream Latte",
      slug: "butterscotch-cream-latte",
      description: "Espresso spesial dengan sirup butterscotch gurih karamel dan krim dingin di atasnya.",
      price: 34000,
      imageUrl: "https://images.unsplash.com/photo-1529892485617-25f63cd7b1e9?w=600&auto=format&fit=crop&q=80",
      categoryId: catSignature.id,
      isActive: true,
    },
    {
      name: "Pandan Coconut Cold Brew",
      slug: "pandan-coconut-cold-brew",
      description: "Perpaduan kopi cold brew segar dengan air kelapa muda alami dan aroma wangi pandan.",
      price: 32000,
      imageUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80",
      categoryId: catSignature.id,
      isActive: true,
    },
    {
      name: "Spanish Cinnamon Latte",
      slug: "spanish-cinnamon-latte",
      description: "Espresso dengan susu kental manis, susu segar, dan taburan kayu manis aromatik.",
      price: 32000,
      imageUrl: "https://images.unsplash.com/photo-1587080413959-06b859fb107d?w=600&auto=format&fit=crop&q=80",
      categoryId: catSignature.id,
      isActive: true,
    },

    // Additional Non-Coffee
    {
      name: "Earl Grey Berry Milk Tea",
      slug: "earl-grey-berry-milk-tea",
      description: "Teh earl grey bergamot aromatik diseduh dengan susu creamy dan sari buah berry segar.",
      price: 26000,
      imageUrl: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=600&auto=format&fit=crop&q=80",
      categoryId: catNonCoffee.id,
      isActive: true,
    },
    {
      name: "Lychee Sparkling Yakult",
      slug: "lychee-sparkling-yakult",
      description: "Minuman soda menyegarkan dengan buah leci asli dan probiotik yakult manis asam.",
      price: 25000,
      imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
      categoryId: catNonCoffee.id,
      isActive: true,
    },
    {
      name: "Peach Blossom Spring Tea",
      slug: "peach-blossom-spring-tea",
      description: "Teh bunga melati dingin dipadukan dengan irisan buah persik manis dan daun mint.",
      price: 24000,
      imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80",
      categoryId: catNonCoffee.id,
      isActive: true,
    },
    {
      name: "Taro Velvet Cream",
      slug: "taro-velvet-cream",
      description: "Minuman taro ungu manis gurih khas dengan lapisan sea salt foam di atasnya.",
      price: 28000,
      imageUrl: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600&auto=format&fit=crop&q=80",
      categoryId: catNonCoffee.id,
      isActive: true,
    },

    // Additional Food & Snacks
    {
      name: "Smoked Beef & Cheese Panini",
      slug: "smoked-beef-cheese-panini",
      description: "Roti ciabatta panggang krispi berisi daging sapi asap, lelehan keju cheddar, dan mustard.",
      price: 36000,
      imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
      categoryId: catFood.id,
      isActive: true,
    },
    {
      name: "Garlic Butter Chicken Wings",
      slug: "garlic-butter-chicken-wings",
      description: "Sayap ayam goreng renyah dibalut saus bawang putih mentega gurih dan parmesan.",
      price: 34000,
      imageUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80",
      categoryId: catFood.id,
      isActive: true,
    },
    {
      name: "Spaghetti Aglio Olio Smoked Beef",
      slug: "spaghetti-aglio-olio-smoked-beef",
      description: "Spaghetti al dente ditumis dengan minyak zaitun, bawang putih, cabai kering, dan smoked beef.",
      price: 42000,
      imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80",
      categoryId: catFood.id,
      isActive: true,
    },
    {
      name: "Mac and Triple Cheese",
      slug: "mac-and-triple-cheese",
      description: "Makaroni panggang dengan saus keju cheddar, mozarella meleleh, dan parmesan gurih.",
      price: 38000,
      imageUrl: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&auto=format&fit=crop&q=80",
      categoryId: catFood.id,
      isActive: true,
    },

    // Additional Dessert & Pastry
    {
      name: "Classic Tiramisu Della Nonna",
      slug: "classic-tiramisu-della-nonna",
      description: "Kue ladyfingers dicelup espresso kental dengan krim keju mascarpone dan taburan bubuk kakao.",
      price: 36000,
      imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80",
      categoryId: catDessert.id,
      isActive: true,
    },
    {
      name: "Red Velvet Molten Cake",
      slug: "red-velvet-molten-cake",
      description: "Kue red velvet lembut dengan isian lelehan krim keju hangat di dalamnya.",
      price: 32000,
      imageUrl: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&auto=format&fit=crop&q=80",
      categoryId: catDessert.id,
      isActive: true,
    },
    {
      name: "Cinnamon Sugar Churros",
      slug: "cinnamon-sugar-churros",
      description: "Churros renyah bertabur gula kayu manis hangat disajikan dengan saus cokelat celup.",
      price: 24000,
      imageUrl: "https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=600&auto=format&fit=crop&q=80",
      categoryId: catDessert.id,
      isActive: true,
    },
    {
      name: "Almond Croissant Supreme",
      slug: "almond-croissant-supreme",
      description: "Croissant mentega dengan isian krim almond frangipane dan taburan irisan kacang almond panggang.",
      price: 28000,
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
      categoryId: catDessert.id,
      isActive: true,
    },
  ];

  const createdProducts = [];
  for (const item of productsData) {
    const p = await prisma.product.create({ data: item });
    createdProducts.push(p);
  }

  console.log(`✓ Seeded ${createdProducts.length} Realistic Products.`);

  // 5. Create Customers
  const custWalkIn = await prisma.customer.create({
    data: {
      name: "Pelanggan Walk-In",
      phone: "-",
      email: null,
    },
  });

  const custDimas = await prisma.customer.create({
    data: {
      name: "Dimas Prasetyo",
      phone: "081234567890",
      email: "dimas@example.com",
    },
  });

  const custAmanda = await prisma.customer.create({
    data: {
      name: "Amanda Putri",
      phone: "089876543210",
      email: "amanda@example.com",
    },
  });

  console.log("✓ Seeded 3 Customers.");

  // 6. Create Completed Orders and Historical Transactions
  // Order 1: Dimas buys Aren Latte (x2) and Croissant (x1)
  const order1Date = new Date();
  order1Date.setHours(order1Date.getHours() - 2);

  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-20260908-001",
      customerId: custDimas.id,
      cashierId: cashier1.id,
      status: OrderStatus.COMPLETED,
      subtotal: 76000, // (26000 * 2) + 24000
      discount: 0,
      tax: 7600, // 10% PB1
      total: 83600,
      createdAt: order1Date,
      updatedAt: order1Date,
      items: {
        create: [
          {
            productId: createdProducts[5].id, // Praz Aren
            productNameSnapshot: "Praz Aren Signature Latte",
            unitPrice: 26000,
            quantity: 2,
            subtotal: 52000,
          },
          {
            productId: createdProducts[10].id, // Croissant
            productNameSnapshot: "French Butter Croissant",
            unitPrice: 24000,
            quantity: 1,
            subtotal: 24000,
          },
        ],
      },
    },
  });

  const payment1 = await prisma.payment.create({
    data: {
      orderId: order1.id,
      provider: "MIDTRANS",
      providerTransactionId: "midtrans-sample-trx-001",
      paymentMethod: PaymentMethod.QRIS,
      amount: 83600,
      status: PaymentStatus.SETTLEMENT,
      rawResponse: {
        transaction_status: "settlement",
        payment_type: "qris",
        gross_amount: "83600.00",
      },
      paidAt: order1Date,
      createdAt: order1Date,
    },
  });

  await prisma.transaction.create({
    data: {
      transactionNumber: "TRX-20260908-001",
      orderId: order1.id,
      paymentId: payment1.id,
      amount: 83600,
      paymentMethod: PaymentMethod.QRIS,
      status: "SUCCESS",
      paidAt: order1Date,
      createdAt: order1Date,
    },
  });

  // Order 2: Walk-In customer buys Cafe Latte (x1) and Basque Cheesecake (x1)
  const order2Date = new Date();
  order2Date.setHours(order2Date.getHours() - 1);

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "ORD-20260908-002",
      customerId: custWalkIn.id,
      cashierId: cashier1.id,
      status: OrderStatus.COMPLETED,
      subtotal: 62000, // 28000 + 34000
      discount: 0,
      tax: 6200,
      total: 68200,
      createdAt: order2Date,
      updatedAt: order2Date,
      items: {
        create: [
          {
            productId: createdProducts[2].id, // Cafe Latte
            productNameSnapshot: "Cafe Latte",
            unitPrice: 28000,
            quantity: 1,
            subtotal: 28000,
          },
          {
            productId: createdProducts[13].id, // Basque Cheesecake
            productNameSnapshot: "Basque Burnt Cheesecake",
            unitPrice: 34000,
            quantity: 1,
            subtotal: 34000,
          },
        ],
      },
    },
  });

  const payment2 = await prisma.payment.create({
    data: {
      orderId: order2.id,
      provider: "CASH",
      providerTransactionId: null,
      paymentMethod: PaymentMethod.CASH,
      amount: 68200,
      status: PaymentStatus.SETTLEMENT,
      rawResponse: { method: "CASH", change: 31800, received: 100000 },
      paidAt: order2Date,
      createdAt: order2Date,
    },
  });

  await prisma.transaction.create({
    data: {
      transactionNumber: "TRX-20260908-002",
      orderId: order2.id,
      paymentId: payment2.id,
      amount: 68200,
      paymentMethod: PaymentMethod.CASH,
      status: "SUCCESS",
      paidAt: order2Date,
      createdAt: order2Date,
    },
  });

  console.log("✓ Seeded 2 Historical Completed Orders and Transactions.");

  // 7. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: owner.id,
      action: "INITIAL_DATABASE_SEED",
      entity: "SYSTEM",
      entityId: "system-init",
      details: {
        note: "Initial realistic seed completed for Praz Space POS.",
        timestamp: new Date().toISOString(),
      },
    },
  });

  console.log("✓ Seeded Audit Log.");
  console.log("✨ Praz Space Cafe Database Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
