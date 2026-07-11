import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, totalAmount, items, slipImageUrl } = body;

    if (!email || !totalAmount || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a unique order number (e.g. ORD-12345678)
    const orderNumber = `ORD-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Create the order in the database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        guestEmail: email,
        totalAmount: parseFloat(totalAmount),
        slipImageUrl: slipImageUrl || null,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            price: item.price,
            quantity: item.quantity || 1,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, orderNumber: order.orderNumber }, { status: 201 });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
