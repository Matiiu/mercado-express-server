import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@prisma-client';

const REFERENCE_PRODUCTS = [
  {
    sku: 'BEB001',
    name: 'Agua Mineral 500ml',
    category: 'Bebidas',
    price: 1500,
    currentStock: 150,
    minStock: 50,
    supplier: 'Distribuidora Andina',
  },
  {
    sku: 'BEB002',
    name: 'Jugo de Naranja 1L',
    category: 'Bebidas',
    price: 3200,
    currentStock: 30,
    minStock: 40,
    supplier: 'Lácteos del Valle',
  },
  {
    sku: 'LAC001',
    name: 'Leche Entera 1L',
    category: 'Lácteos',
    price: 2100,
    currentStock: 200,
    minStock: 60,
    supplier: 'Lácteos del Valle',
  },
  {
    sku: 'LAC002',
    name: 'Yogur Natural 500g',
    category: 'Lácteos',
    price: 2800,
    currentStock: 15,
    minStock: 25,
    supplier: 'Lácteos del Valle',
  },
  {
    sku: 'SNA001',
    name: 'Papas Fritas 200g',
    category: 'Snacks',
    price: 2500,
    currentStock: 80,
    minStock: 30,
    supplier: 'SnacksCorp',
  },
  {
    sku: 'LIM001',
    name: 'Detergente 1L',
    category: 'Limpieza',
    price: 4500,
    currentStock: 45,
    minStock: 20,
    supplier: 'Químicos del Sur',
  },
];

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  for (const product of REFERENCE_PRODUCTS) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product,
    });
  }

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
