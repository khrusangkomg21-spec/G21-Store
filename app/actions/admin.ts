'use server'

import prisma from '@/lib/prisma';
import { getSession } from './auth';
import { sendDeliveryEmail } from '@/lib/email';

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
  
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'COMPLETED' },
    include: { user: true }
  });
  
  const downloadLink = 'https://g21-store.com/downloads/' + order.id; // Replace with actual path in future
  const customerEmail = order.guestEmail || order.user?.email;
  
  if (customerEmail) {
    await sendDeliveryEmail(customerEmail, order.orderNumber, downloadLink);
  }
  
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

export async function importLegacyCustomers(customers: { facebookName: string, name?: string, vipP1ToP3: boolean, vipP4ToP6: boolean, legacyPackages?: string }[]) {
  await checkAdmin();
  
  // 1. Prepare fast lookups
  const fbNames = customers.map(c => c.facebookName?.trim()).filter(Boolean) as string[];
  const realNames = customers.map(c => c.name?.trim()).filter(Boolean) as string[];
  
  // Fetch ALL existing in one go (prevents Vercel 10s timeout!)
  const existingUsers = await prisma.user.findMany({
    where: {
      OR: [
        { facebookName: { in: fbNames, not: '' } },
        { name: { in: realNames, not: '' } }
      ]
    }
  });

  let imported = 0;
  const updates = [];
  const creates = [];

  for (const cust of customers) {
    const fbName = cust.facebookName?.trim();
    const realName = cust.name?.trim();
    
    if (!fbName && !realName) continue;
    
    // Find existing from our pre-fetched list
    let existing = null;
    if (fbName) existing = existingUsers.find(u => u.facebookName === fbName);
    if (!existing && realName) existing = existingUsers.find(u => u.name === realName);
    
    if (!existing) {
      creates.push({
        email: `legacy_${Date.now()}_${Math.floor(Math.random() * 100000)}@g21.local`,
        facebookName: fbName || null,
        name: realName || null,
        isVip: cust.vipP1ToP3, // Legacy mapping
        vipP1ToP3: cust.vipP1ToP3,
        vipP4ToP6: cust.vipP4ToP6,
        legacyPackages: cust.legacyPackages || null,
        password: 'legacy_user'
      });
      imported++;
      
      // Add to existingUsers in-memory to prevent duplicates within the same Excel file
      existingUsers.push({
        id: `temp-${Date.now()}-${Math.random()}`,
        facebookName: fbName || null,
        name: realName || null,
        isVip: cust.vipP1ToP3,
        vipP1ToP3: cust.vipP1ToP3,
        vipP4ToP6: cust.vipP4ToP6,
        legacyPackages: cust.legacyPackages || null,
        email: '', password: null, role: 'USER', phone: null, vipNumber: null, resetToken: null, resetTokenExpiry: null, createdAt: new Date(), updatedAt: new Date()
      });
    } else {
      let newPackages = existing.legacyPackages || '';
      if (cust.legacyPackages) {
        const existingPkgArray = newPackages.split(',').map(p => p.trim()).filter(Boolean);
        const newPkgArray = cust.legacyPackages.split(',').map(p => p.trim()).filter(Boolean);
        const mergedSet = new Set([...existingPkgArray, ...newPkgArray]);
        newPackages = Array.from(mergedSet).join(',');
      }
      
      const shouldUpdateVipP1 = cust.vipP1ToP3 && !existing.vipP1ToP3;
      const shouldUpdateVipP4 = cust.vipP4ToP6 && !existing.vipP4ToP6;
      const shouldUpdatePackages = newPackages !== existing.legacyPackages;
      const shouldUpdateName = cust.name && !existing.name;
      
      if (shouldUpdateVipP1 || shouldUpdateVipP4 || shouldUpdatePackages || shouldUpdateName || (!existing.isVip && cust.vipP1ToP3)) {
        updates.push(
          prisma.user.update({
            where: { id: existing.id },
            data: { 
              isVip: cust.vipP1ToP3 || existing.isVip,
              vipP1ToP3: cust.vipP1ToP3 || existing.vipP1ToP3,
              vipP4ToP6: cust.vipP4ToP6 || existing.vipP4ToP6,
              name: existing.name || cust.name,
              legacyPackages: newPackages || null
            }
          })
        );
        imported++;
        
        // Update in-memory to prevent duplicate updates
        existing.vipP1ToP3 = cust.vipP1ToP3 || existing.vipP1ToP3;
        existing.vipP4ToP6 = cust.vipP4ToP6 || existing.vipP4ToP6;
        existing.legacyPackages = newPackages || null;
      }
    }
  }
  
  // Execute bulk DB operations
  if (creates.length > 0) {
    await prisma.user.createMany({ data: creates, skipDuplicates: true });
  }
  if (updates.length > 0) {
    await Promise.all(updates);
  }
  
  return { success: true, count: imported };
}

export async function createProduct(data: { id: string, title: string, description?: string, price: number, category: string, grade: string, downloadUrl?: string, images?: string[], isActive?: boolean }) {
  await checkAdmin();
  const exists = await prisma.product.findUnique({ where: { id: data.id } });
  if (exists) throw new Error('รหัสสินค้านี้มีอยู่แล้วในระบบ');
  
  return await prisma.product.create({ data });
}

export async function updateProduct(id: string, data: { title?: string, description?: string, price?: number, category?: string, grade?: string, downloadUrl?: string, images?: string[], isActive?: boolean }) {
  await checkAdmin();
  return await prisma.product.update({
    where: { id },
    data
  });
}

export async function deleteProduct(id: string) {
  await checkAdmin();
  return await prisma.product.delete({
    where: { id }
  });
}
