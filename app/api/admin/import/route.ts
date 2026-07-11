import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { users } = await req.json();

    if (!Array.isArray(users)) {
      return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 400 });
    }

    let imported = 0;
    
    for (const u of users) {
      if (!u.facebookName && !u.name) continue;
      
      const dummyEmail = u.facebookName ? `${u.facebookName.replace(/\s+/g, '')}@import.local` : `user_${Date.now()}_${Math.random()}@import.local`;
      
      const existingUser = u.facebookName ? await prisma.user.findFirst({ where: { facebookName: u.facebookName } }) : null;

      if (existingUser) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: u.name || existingUser.name,
            isVip: u.isVip || existingUser.isVip,
            phone: u.phone || existingUser.phone
          }
        });
      } else {
        await prisma.user.create({
          data: {
            email: dummyEmail,
            name: u.name || '',
            facebookName: u.facebookName || '',
            isVip: u.isVip || false,
            role: 'USER',
            password: 'imported_no_password'
          }
        });
      }
      imported++;
    }

    return NextResponse.json({ success: true, message: `อิมพอร์ตข้อมูลสำเร็จ ${imported} รายการ` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
