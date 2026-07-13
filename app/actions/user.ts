'use server'

import prisma from '@/lib/prisma';
import { getSession } from './auth';

export async function getMyFiles() {
  const session = await getSession();
  
  if (!session) {
    throw new Error('กรุณาล็อกอินเพื่อดูไฟล์ของคุณ');
  }

  // Get COMPLETED orders for this user
  const orders = await prisma.order.findMany({
    where: { 
      userId: session.userId as string,
      status: 'COMPLETED'
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  // Get the user to check legacyPackages
  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { legacyPackages: true }
  });

  // Extract all purchased products from new system orders
  const purchasedProducts = orders.flatMap(order => 
    order.items.map(item => item.product)
  );

  // If user has legacy packages, fetch those products too
  if (user && user.legacyPackages) {
    const legacyProductIds = user.legacyPackages.split(',').map(id => id.trim()).filter(id => id.length > 0);
    if (legacyProductIds.length > 0) {
      const legacyProducts = await prisma.product.findMany({
        where: { id: { in: legacyProductIds } }
      });
      purchasedProducts.push(...legacyProducts);
    }
  }

  // Remove duplicates just in case
  const uniqueProductsMap = new Map();
  purchasedProducts.forEach(prod => {
    uniqueProductsMap.set(prod.id, prod);
  });

  return Array.from(uniqueProductsMap.values());
}
