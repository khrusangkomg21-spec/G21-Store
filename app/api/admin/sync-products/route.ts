import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const subjects = [
  { id: 'sci', title: 'วิทยาศาสตร์ สิ่งแวดล้อม และเทคโนโลยี' },
  { id: 'soc', title: 'สังคมและความเป็นพลเมือง' },
  { id: 'eco', title: 'เศรษฐกิจและการเงิน' },
  { id: 'hea', title: 'สุขภาพกายและจิต' },
  { id: 'art', title: 'ศิลปะและวัฒนธรรมเพื่อสุนทรียภาพ' },
  { id: 'eng', title: 'ภาษาอังกฤษ' },
];

const grades = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

const standardPackages = [
  { id: 'single-normal', name: 'แผนการสอน 40 ชั่วโมง + ใบงานพร้อมเฉลย', price: 150 },
  { id: 'single-post', name: 'บันทึกหลังสอน (120 แบบ)', price: 99 },
  { id: 'single-onepage', name: 'แผนหน้าเดียว', price: 89 },
  { id: 'single-worksheet', name: 'ใบงาน PNG ไม่ติดลายน้ำ', price: 79 },
  { id: 'single-exam', name: 'ข้อสอบพร้อมเฉลย', price: 59 },
];

const englishPackages = [
  { id: 'single-normal-eng', name: 'แผนการสอน 80 ชั่วโมง + ใบงานพร้อมเฉลย', price: 250 },
  { id: 'single-post-eng', name: 'บันทึกหลังสอน', price: 159 },
  { id: 'single-onepage-eng', name: 'แผนหน้าเดียว', price: 149 },
  { id: 'single-worksheet-eng', name: 'ใบงาน PNG ไม่ติดลายน้ำ', price: 129 },
  { id: 'single-exam-eng', name: 'ข้อสอบพร้อมเฉลย', price: 59 },
];

export async function GET() {
  try {
    let count = 0;

    // Delete existing combo packages from database
    await prisma.product.deleteMany({
      where: {
        id: { contains: 'combo' }
      }
    });

    // 1. Seed VIP Groups
    await prisma.product.upsert({
      where: { id: 'vip-p1-p3' },
      update: {},
      create: {
        id: 'vip-p1-p3',
        title: 'แพ็กเกจ VIP',
        description: 'ครบ จบ ในกลุ่มเดียว (ได้ครบทั้ง 5 วิชาทุกชั้น + แผน + ใบงาน + ข้อสอบ)',
        price: 990,
        category: 'VIP',
        grade: 'ป.1-3',
      }
    });
    count++;

    await prisma.product.upsert({
      where: { id: 'vip-p4-p6' },
      update: {},
      create: {
        id: 'vip-p4-p6',
        title: 'แพ็กเกจ VIP',
        description: 'ครบ จบ ในกลุ่มเดียว (รอติดตามเร็วๆ นี้)',
        price: 990,
        category: 'VIP',
        grade: 'ป.4-6',
      }
    });
    count++;

    // 2. Seed Subjects x Grades x Packages
    for (const subject of subjects) {
      for (const grade of grades) {
        const pkgs = subject.id === 'eng' ? englishPackages : standardPackages;
        
        for (const pkg of pkgs) {
          const productId = `${subject.id}-${grade}-${pkg.id}`;
          
          await prisma.product.upsert({
            where: { id: productId },
            update: {}, // Do not overwrite downloadUrl if it exists
            create: {
              id: productId,
              title: `${pkg.name}`,
              description: `${subject.title} ป.${grade.replace('P', '')}`,
              price: pkg.price,
              category: subject.id,
              grade: grade,
            }
          });
          count++;
        }
      }
    }

    return NextResponse.json({ success: true, message: `Synced ${count} products successfully!` });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
