import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = id;

    // 1. Update order status to APPROVED in database
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'APPROVED' },
    });

    // 2. Mock Email Sending
    // In production, use Resend or SendGrid:
    // await resend.emails.send({
    //   from: 'G21 <no-reply@g21-education.com>',
    //   to: order.guestEmail || order.user?.email,
    //   subject: '✅ รับไฟล์แผนการสอนของคุณ + ลิงก์เข้ากลุ่ม VIP',
    //   html: '<p>ขอบคุณที่สั่งซื้อ...</p>'
    // });

    console.log(`[Email Sent] To: ${order.guestEmail} for Order: ${order.orderNumber}`);

    return NextResponse.json({ success: true, message: 'Order approved and email sent.' });
  } catch (error) {
    console.error('Error approving order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
