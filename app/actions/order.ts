'use server'

import prisma from '@/lib/prisma';
import { getSession } from './auth';
import { sendLineNotify } from '@/lib/lineNotify';
import { checkSlipWithSlipOK } from '@/lib/slipok';
import { sendDeliveryEmail } from '@/lib/email';
import { getActivePromoDiscount } from '@/lib/promotions';

export async function createOrder(formData: FormData) {
  try {
    const session = await getSession();
    const cartDataStr = formData.get('cart') as string;
    const slipFile = formData.get('slip') as File;
    const clientTotalAmount = parseFloat(formData.get('totalAmount') as string);
    const clientDiscount = parseFloat((formData.get('discount') as string) || '0');
    const discountCode = formData.get('discountCode') as string || null;

    if (!cartDataStr || !slipFile) {
      return { error: 'ข้อมูลไม่ครบถ้วน กรุณาแนบสลิปโอนเงิน' };
    }

    if (!session || !session.userId) {
      return { error: 'กรุณาล็อกอินก่อนสั่งซื้อสินค้าครับ' };
    }

    const cartData = JSON.parse(cartDataStr);
    
    // Check if promo code is valid on the server
    const promo = discountCode ? await getActivePromoDiscount(discountCode) : null;
    
    // Calculate subtotal from cart to prevent client-side tampering
    let realSubtotal = 0;
    const orderItemsData = [];
    
    for (const item of cartData) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) continue;
      realSubtotal += product.price;
      orderItemsData.push({
        productId: product.id,
        price: product.price
      });
    }

    const realDiscount = promo ? promo.amount : 0;
    const realTotalAmount = Math.floor(realSubtotal - realDiscount);

    // Save the slip image as Base64 (Vercel serverless compatibility)
    const bytes = await slipFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${slipFile.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    const slipImageUrl = base64Image;

    // Verify slip with SlipOK API using SERVER CALCULATED amount!
    const slipVerification = await checkSlipWithSlipOK(slipFile, realTotalAmount);
    
    // Auto approve ONLY if SlipOK verifies the transfer AND the amount matches our REAL total
    const isAutoApproved = slipVerification.success && slipVerification.data?.success && slipVerification.data?.amount >= realTotalAmount;

    // Create Order in Database
    const orderNumber = `ORD-${Math.floor(Math.random() * 1000000)}-${new Date().getMilliseconds()}`;
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: realTotalAmount,
        discount: realDiscount,
        discountCode: promo ? promo.name : discountCode,
        slipImageUrl,
        status: isAutoApproved ? 'COMPLETED' : 'PENDING',
        userId: session.userId as string,
        items: {
          create: orderItemsData
        }
      },
      include: {
        user: true
      }
    });

    // Send LINE Notify
    const orderDetails = `
📦 มีออเดอร์ใหม่! ${isAutoApproved ? '(อนุมัติอัตโนมัติ ✅)' : '(รอตรวจสอบ ⏳)'}
รหัส: ${orderNumber}
ลูกค้า: สมาชิก (ID: ${(session.userId as string).slice(-6)})
ยอดโอน: ฿${realTotalAmount}
ส่วนลด: ฿${realDiscount} ${promo ? `(${promo.name})` : (discountCode ? `(${discountCode})` : '')}
รายการ: ${cartData.length} รายการ`;
    
    await sendLineNotify(orderDetails);

    // Send Delivery Email if Auto-Approved
    if (isAutoApproved) {
      const downloadLink = 'https://g21-store.com/downloads/' + order.id;
      const customerEmail = order.user?.email;
      if (customerEmail) {
        await sendDeliveryEmail(customerEmail, order.orderNumber, downloadLink);
      }
    }

    return { success: true, orderId: order.id, orderNumber: order.orderNumber };

  } catch (error: any) {
    console.error('Create Order Error:', error);
    return { error: 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ: ' + (error.message || String(error)) };
  }
}
