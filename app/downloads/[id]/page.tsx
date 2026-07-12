import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Navbar from '@/app/components/Navbar';
import { getSession } from '@/app/actions/auth';
import DownloadAuthForm from './DownloadAuthForm';

export const metadata = {
  title: 'ดาวน์โหลดไฟล์ | G21 Lesson Plan Store',
  description: 'ดาวน์โหลดไฟล์สื่อการสอนของคุณ',
};

export default async function DownloadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true
        }
      },
      user: true
    }
  });

  if (!order) {
    notFound();
  }

  // Check if it's completed
  if (order.status !== 'COMPLETED') {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white selection:bg-[#FACC15] selection:text-black">
        <Navbar session={session} />
        <main className="max-w-3xl mx-auto px-4 py-12 pt-32 text-center">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h1 className="text-2xl font-bold mb-4 text-yellow-500">⏳ ออเดอร์กำลังรอตรวจสอบ</h1>
            <p className="text-gray-300">
              ออเดอร์หมายเลข {order.orderNumber} ของคุณอยู่ในสถานะรอตรวจสอบยอดเงินโอน<br/>
              เมื่อแอดมินอนุมัติแล้ว คุณจะสามารถดาวน์โหลดไฟล์จากหน้านี้ได้ครับ
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Auth logic: User must either be logged in as the owner, OR enter the guestEmail that matches.
  // We will handle the guestEmail check via a client component form if not logged in as the owner.
  
  const isOwnerLoggedIn = session && order.userId === session.userId;
  
  return (
    <div className="min-h-screen bg-[#0F172A] text-white selection:bg-[#FACC15] selection:text-black">
      <Navbar session={session} />
      <main className="max-w-4xl mx-auto px-4 py-12 pt-32">
        <div className="bg-[#1E293B] border border-gray-700 rounded-xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
            <h1 className="text-2xl font-bold">📥 รายการดาวน์โหลดของคุณ</h1>
            <span className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
              อนุมัติแล้ว
            </span>
          </div>
          
          <div className="mb-6 text-gray-300">
            <p><strong>หมายเลขคำสั่งซื้อ:</strong> {order.orderNumber}</p>
            <p><strong>วันที่สั่งซื้อ:</strong> {new Date(order.createdAt).toLocaleDateString('th-TH')}</p>
          </div>

          {!isOwnerLoggedIn ? (
            <DownloadAuthForm requiredEmail={order.guestEmail || order.user?.email || ''} items={order.items} />
          ) : (
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold mb-4 text-[#FACC15]">ไฟล์สื่อการสอน</h2>
              {order.items.map(item => (
                <div key={item.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700">
                  <div>
                    <h3 className="font-semibold text-white">{item.product.title}</h3>
                    <p className="text-sm text-gray-400">{item.product.description}</p>
                  </div>
                  {item.product.downloadUrl ? (
                    <a 
                      href={item.product.downloadUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#FACC15] text-black font-semibold rounded-lg hover:bg-[#F59E0B] transition-colors"
                    >
                      ดาวน์โหลด
                    </a>
                  ) : (
                    <span className="text-gray-500 italic">รออัปเดตลิงก์</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
