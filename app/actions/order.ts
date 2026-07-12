'use server'

import prisma from '@/lib/prisma';
import { getSession } from './auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { sendLineNotify } from '@/lib/lineNotify';
import { checkSlipWithSlipOK } from '@/lib/slipok';
import { sendDeliveryEmail } from '@/lib/email';

export async function createOrder(formData: FormData) {
  try {
    const session = await getSession();
    const guestEmail = formData.get('guestEmail') as string;
    const cartDataStr = formData.get('cart') as string;
    const slipFile = formData.get('slip') as File;
    const totalAmount = parseFloat(formData.get('totalAmount') as string);
    const discount = parseFloat((formData.get('discount') as string) || '0');
    const discountCode = formData.get('discountCode') as string || null;

    if (!cartDataStr || !slipFile) {
      return { error: 'ข้อมูลไม่ครบถ้วน กรุณาแนบสลิปโอนเงิน' };
    }

    if (!session && !guestEmail) {
      return { error: 'กรุณากรอกอีเมลเพื่อรับลิงก์ดาวน์โหลด (สำหรับผู้ที่ไม่ได้ล็อกอิน)' };
    }

    const cartData = JSON.parse(cartDataStr);
    if (!Array.isArray(cartData) || cartData.length === 0) {
      return { error: 'ไม่มีสินค้าในตะกร้า' };
    }

    // Save the slip image
    const bytes = await slipFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'slips');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // ignore if exists
    }
    
    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(slipFile.name)}`;
    const slipPath = path.join(uploadDir, uniqueFileName);
    await writeFile(slipPath, buffer);
    const slipImageUrl = `/uploads/slips/${uniqueFileName}`;

    // Verify slip with SlipOK API
    const slipVerification = await checkSlipWithSlipOK(slipPath, totalAmount);
    const isAutoApproved = slipVerification.success && slipVerification.data?.success && slipVerification.data?.amount === totalAmount;

    // Create Order in DB
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount,
        discount,
        discountCode,
        slipImageUrl,
        status: isAutoApproved ? 'COMPLETED' : 'PENDING',
        userId: session?.userId as string | undefined,
        guestEmail: session ? undefined : guestEmail,
        items: {
          create: cartData.map((item: any) => ({
            productId: item.id,
            price: item.price,
            quantity: 1
          }))
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
ลูกค้า: ${session?.userId ? 'สมาชิก' : guestEmail}
ยอดโอน: ฿${totalAmount}
ส่วนลด: ฿${discount} ${discountCode ? `(${discountCode})` : ''}
รายการ: ${cartData.length} รายการ`;
    
    await sendLineNotify(orderDetails);

    // Send Delivery Email if Auto-Approved
    if (isAutoApproved) {
      const downloadLink = 'https://g21-store.com/downloads/' + order.id;
      const customerEmail = session ? order.user?.email : guestEmail;
      if (customerEmail) {
        await sendDeliveryEmail(customerEmail, order.orderNumber, downloadLink);
      }
    }

    return { success: true, orderId: order.id, orderNumber: order.orderNumber };

  } catch (error) {
    console.error('Create Order Error:', error);
    return { error: 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง' };
  }
}
