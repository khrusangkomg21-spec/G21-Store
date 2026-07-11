'use server'

import prisma from '../../lib/prisma'

export async function saveProductLink(id: string, name: string, link: string) {
  try {
    await prisma.product.upsert({
      where: { id },
      update: { downloadUrl: link },
      create: {
        id,
        title: name,
        price: 0,
        category: 'Uncategorized',
        grade: 'General',
        downloadUrl: link
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving product link:', error);
    return { success: false, error: 'Failed to save to database' };
  }
}

export async function getSavedLinks() {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, downloadUrl: true }
    });
    return products;
  } catch (error) {
    console.error('Error getting saved links:', error);
    return [];
  }
}
