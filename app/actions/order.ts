'use server'

import prisma from '@/lib/prisma';
import { getSession } from './auth';

export async function createOrder(formData: FormData) {
  try {
    const session = await getSession();
    const guestEmail = formData.get('guestEmail') as string;
    const cartDataStr = formData.get('cart') as string;
    const slipBase64 = formData.get('slipBase64') as string;
    const totalAmount = parseFloat(formData.get('totalAmount') as string);

    if (!cartDataStr || !slipBase64) {
      return { error: 'ข้อมูลไม่ครบถ้วน กรุณาแนบสลิปโอนเงิน' };
    }

    if (!session && !guestEmail) {
      return { error: 'กรุณากรอกอีเมลเพื่อรับลิงก์ดาวน์โหลด (สำหรับผู้ที่ไม่ได้ล็อกอิน)' };
    }

    const cartData = JSON.parse(cartDataStr);
    if (!Array.isArray(cartData) || cartData.length === 0) {
      return { error: 'ไม่มีสินค้าในตะกร้า' };
    }

    // สร้าง Order
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount,
        slipImageUrl: slipBase64, // เก็บรูปเป็นรหัสข้อความลง DB โดยตรง
        status: 'PENDING',
        userId: session?.userId as string | undefined,
        guestEmail: session ? undefined : guestEmail,
        items: {
          create: cartData.map((item: any) => ({
            productId: item.id,
            price: item.price,
            quantity: 1
          }))
        }
      }
    });

    return { success: true, orderId: order.id, orderNumber: order.orderNumber };

  } catch (error) {
    console.error('Create Order Error:', error);
    return { error: 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง' };
  }
}
