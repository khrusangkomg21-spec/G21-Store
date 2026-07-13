import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import CheckoutClient from './CheckoutClient';

export default async function CheckoutPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login?message=' + encodeURIComponent('กรุณาล็อกอินหรือสมัครสมาชิกก่อนสั่งซื้อสินค้าครับ (เพื่อความปลอดภัยในการเก็บลิงก์ดาวน์โหลดของคุณ)'));
  }

  return <CheckoutClient />;
}
