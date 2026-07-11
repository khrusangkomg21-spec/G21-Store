'use server'

import prisma from '@/lib/prisma';
import { getSession } from './auth';

async function checkAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized. Admin access only.');
  }
}

export async function getPendingOrders() {
  await checkAdmin();
  
  return await prisma.order.findMany({
    where: { status: 'PENDING' },
    include: {
      items: {
        include: {
          product: true
        }
      },
      user: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getCompletedOrders() {
  await checkAdmin();
  
  return await prisma.order.findMany({
    where: { status: 'COMPLETED' },
    include: {
      items: {
        include: {
          product: true
        }
      },
      user: true
    },
    orderBy: { updatedAt: 'desc' },
    take: 50 // Limit for performance
  });
}

export async function approveOrder(orderId: string) {
  await checkAdmin();
  
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'COMPLETED' }
  });
  
  return { success: true };
}

export async function rejectOrder(orderId: string) {
  await checkAdmin();
  
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' }
  });
  
  return { success: true };
}

export async function getAllProducts() {
  await checkAdmin();
  
  return await prisma.product.findMany({
    orderBy: [
      { category: 'asc' },
      { grade: 'asc' }
    ]
  });
}

export async function updateProductLink(productId: string, downloadUrl: string) {
  await checkAdmin();
  
  await prisma.product.update({
    where: { id: productId },
    data: { downloadUrl }
  });
  
  return { success: true };
}
