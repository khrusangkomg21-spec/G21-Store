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

  // Extract all purchased products
  const purchasedProducts = orders.flatMap(order => 
    order.items.map(item => item.product)
  );

  // Remove duplicates just in case
  const uniqueProductsMap = new Map();
  purchasedProducts.forEach(prod => {
    uniqueProductsMap.set(prod.id, prod);
  });

  return Array.from(uniqueProductsMap.values());
}
