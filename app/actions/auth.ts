'use server'

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

const secretKey = 'g21-secret-key-mockup-for-mvp'; // In production, use process.env.JWT_SECRET
const key = new TextEncoder().encode(secretKey);

export async function register(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    if (!email || !password) {
      return { error: 'กรุณากรอกอีเมลและรหัสผ่าน' };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: 'อีเมลนี้มีผู้ใช้งานแล้ว' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'USER',
      },
    });

    // Automatically log in after registration
    await setSession(user.id, user.email, user.role);

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

    await setSession(user.id, user.email, user.role);

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function logout() {
  (await cookies()).delete('session');
  return { success: true };
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

async function setSession(userId: string, email: string, role: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await new SignJWT({ userId, email, role })
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
