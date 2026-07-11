import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Count total VIP members
    const vipCount = await prisma.user.count({
      where: { isVip: true }
    });

    let currentPrice = 299;
    
    // สมาชิกลำดับ 1-50 ราคา 299
    // สมาชิกลำดับ 51-150 ราคา 399
    // สมาชิกลำดับ 151 เป็นต้นไป ราคา 999
    
    if (vipCount >= 150) {
      currentPrice = 999;
    } else if (vipCount >= 50) {
      currentPrice = 399;
    } else {
      currentPrice = 299;
    }

    return NextResponse.json({ 
      success: true, 
      price: currentPrice, 
      count: vipCount,
      nextTier: vipCount < 50 ? 50 : vipCount < 150 ? 150 : null
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
