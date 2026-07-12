'use server'

import prisma from '@/lib/prisma';
import { getSession } from './auth';

async function checkAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized. Admin access only.');
  }
}

export async function getDashboardStats() {
  await checkAdmin();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const pendingCount = await prisma.order.count({
    where: { status: 'PENDING' }
  });

  const approvedToday = await prisma.order.count({
    where: { 
      status: 'COMPLETED',
      updatedAt: { gte: today }
    }
  });

  const salesTodayAggr = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { 
      status: 'COMPLETED',
      updatedAt: { gte: today }
    }
  });

  const salesMonthAggr = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { 
      status: 'COMPLETED',
      updatedAt: { gte: startOfMonth }
    }
  });

  return {
    pendingCount,
    approvedToday,
    salesToday: salesTodayAggr._sum.totalAmount || 0,
    salesMonth: salesMonthAggr._sum.totalAmount || 0
  };
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
    take: 500 // Increased limit to allow filtering historical orders
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

export async function getAllCustomers() {
  await checkAdmin();
  
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function importLegacyCustomers(customers: { facebookName: string, name?: string, isVip: boolean, legacyPackages?: string }[]) {
  await checkAdmin();
  
  let imported = 0;
  for (const cust of customers) {
    if (!cust.facebookName) continue;
    
    // Check if exists
    const existing = await prisma.user.findFirst({
      where: { facebookName: cust.facebookName }
    });
    
    if (!existing) {
      await prisma.user.create({
        data: {
          email: `legacy_${Date.now()}_${Math.floor(Math.random() * 10000)}@g21.local`,
          facebookName: cust.facebookName,
          name: cust.name || null,
          isVip: cust.isVip,
          legacyPackages: cust.legacyPackages || null,
          password: 'legacy_user'
        }
      });
      imported++;
    } else {
      // Update existing customer (VIP status and append new packages)
      let newPackages = existing.legacyPackages || '';
      if (cust.legacyPackages) {
        const existingPkgArray = newPackages.split(',').map(p => p.trim()).filter(Boolean);
        const newPkgArray = cust.legacyPackages.split(',').map(p => p.trim()).filter(Boolean);
        
        // Merge without duplicates
        const mergedSet = new Set([...existingPkgArray, ...newPkgArray]);
        newPackages = Array.from(mergedSet).join(',');
      }
      
      const shouldUpdateVip = cust.isVip && !existing.isVip;
      const shouldUpdatePackages = newPackages !== existing.legacyPackages;
      const shouldUpdateName = cust.name && !existing.name;
      
      if (shouldUpdateVip || shouldUpdatePackages || shouldUpdateName) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { 
            isVip: cust.isVip || existing.isVip,
            name: existing.name || cust.name,
            legacyPackages: newPackages || null
          }
        });
        imported++;
      }
    }
  }
  
  return { success: true, count: imported };
}
