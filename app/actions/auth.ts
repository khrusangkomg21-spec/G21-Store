'use server'

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

const secretKey = process.env.JWT_SECRET || 'g21-secret-key-fallback-do-not-use-in-prod';
const key = new TextEncoder().encode(secretKey);

export async function checkLegacyCustomer(facebookName: string) {
  if (!facebookName) return false;
  const existing = await prisma.user.findFirst({
    where: { facebookName, email: { startsWith: 'legacy_' } }
  });
  return !!existing;
}

export async function register(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const facebookName = formData.get('facebookName') as string;

    if (!email || !password) {
      return { error: 'กรุณากรอกอีเมลและรหัสผ่าน' };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: 'อีเมลนี้มีผู้ใช้งานแล้ว' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let user;

    if (facebookName) {
      const legacyUser = await prisma.user.findFirst({
        where: { facebookName, email: { startsWith: 'legacy_' } }
      });

      if (legacyUser) {
        // Upgrade legacy user to normal user
        user = await prisma.user.update({
          where: { id: legacyUser.id },
          data: {
            email,
            name: name || legacyUser.name,
            password: hashedPassword,
            role: 'USER',
          }
        });
        
        // Auto create orders for legacy packages
        if (legacyUser.legacyPackages) {
          const packages = legacyUser.legacyPackages.split(',').map(p => p.trim()).filter(Boolean);
          if (packages.length > 0) {
            // Find valid products
            const validProducts = await prisma.product.findMany({
              where: { id: { in: packages } }
            });
            
            if (validProducts.length > 0) {
              const total = validProducts.reduce((sum, p) => sum + p.price, 0);
              
              // Create an approved order
              await prisma.order.create({
                data: {
                  orderNumber: `LEGACY-${Date.now()}`,
                  userId: user.id,
                  totalAmount: total,
                  status: 'COMPLETED',
                  items: {
                    create: validProducts.map(p => ({
                      productId: p.id,
                      price: p.price,
                      quantity: 1
                    }))
                  }
                }
              });
            }
          }
        }
      } else {
        user = await prisma.user.create({
          data: { email, name, password: hashedPassword, role: 'USER', facebookName },
        });
      }
    } else {
      user = await prisma.user.create({
        data: { email, name, password: hashedPassword, role: 'USER' },
      });
    }

    // Automatically log in after registration
    await setSession(user.id, user.email, user.role, user.isVip, user.vipP1ToP3, user.vipP4ToP6);

    return { success: true };
  } catch (error) {
    console.error('Register error:', error);
    return { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function login(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { error: 'กรุณากรอกอีเมลและรหัสผ่าน' };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    }

    await setSession(user.id, user.email, user.role, user.isVip, user.vipP1ToP3, user.vipP4ToP6);

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' };
  }
}

import { redirect } from 'next/navigation';

export async function logout() {
  (await cookies()).delete('session');
  redirect('/login');
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, key);
    return payload;
  } catch (error) {
    return null;
  }
}

async function setSession(userId: string, email: string, role: string, isVip: boolean = false, vipP1ToP3: boolean = false, vipP4ToP6: boolean = false) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const actualVipP1ToP3 = isVip || vipP1ToP3; // Legacy mapped to P1-P3
  const session = await new SignJWT({ userId, email, role, isVip, vipP1ToP3: actualVipP1ToP3, vipP4ToP6 })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);

  (await cookies()).set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    sameSite: 'lax',
    path: '/',
  });
}
