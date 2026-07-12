import { redirect } from 'next/navigation';
import { getSession } from '@/app/actions/auth';
import prisma from '@/lib/prisma';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';

export const metadata = {
  title: 'ห้องลับ VIP ป.1-3 | G21 Lesson Plan Store',
  description: 'ดาวน์โหลดไฟล์สื่อการสอนสำหรับลูกค้า VIP',
};

export default async function VIPRoomP13() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (!session.isVip && !session.vipP1ToP3) {
    // If logged in but not VIP P1-3, redirect to home
    redirect('/');
  }

  // Fetch products that are active, not english, not combo, and grade is P1, P2, P3
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      grade: { in: ['P1', 'P2', 'P3'] },
      NOT: [
        { id: { startsWith: 'eng-' } },
        { id: { contains: '-combo-' } }
      ]
    },
    orderBy: [
      { category: 'asc' },
      { grade: 'asc' },
      { id: 'asc' }
    ]
  });

  // Group by category for nicer display
  const categoryMap: Record<string, typeof products> = {
    'สังคมศึกษา': [],
    'คณิตศาสตร์': [],
    'วิทยาศาสตร์': [],
    'ภาษาไทย': [],
    'ประวัติศาสตร์': [],
    'สุขศึกษาและพลศึกษา': [],
    'เศรษฐศาสตร์': [],
  };

  const uncategorized: typeof products = [];

  products.forEach(p => {
    if (categoryMap[p.category]) {
      categoryMap[p.category].push(p);
    } else {
      uncategorized.push(p);
    }
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-white selection:bg-[#FACC15] selection:text-black">
      <Navbar session={session} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
        <div className="bg-gradient-to-r from-[#FACC15]/20 to-[#F59E0B]/20 border border-[#FACC15]/30 rounded-2xl p-8 mb-12 shadow-[0_0_40px_rgba(250,204,21,0.1)] backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">👑</span>
            <h1 className="text-3xl font-bold text-[#FACC15]">ยินดีต้อนรับสู่ห้อง VIP [ป.1 - ป.3]</h1>
          </div>
          <p className="text-gray-300 text-lg">
            คุณสามารถดาวน์โหลดสื่อการสอนทั้งหมด (5 วิชาหลัก ยกเว้นภาษาอังกฤษและคอมโบเซ็ต) ได้ฟรีทันทีจากหน้านี้ค่ะ
          </p>
        </div>

        {Object.entries(categoryMap).map(([cat, items]) => {
          if (items.length === 0) return null;
          return (
            <div key={cat} className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
                <span className="w-2 h-6 bg-[#FACC15] rounded-full inline-block"></span>
                {cat}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(product => (
                  <div key={product.id} className="bg-[#1E293B] border border-gray-700/50 rounded-xl p-5 hover:border-[#FACC15]/50 transition-colors flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-md">{product.grade}</span>
                      <span className="text-xs text-gray-500 font-mono">{product.id}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex-grow">{product.title}</h3>
                    
                    {product.downloadUrl ? (
                      <a 
                        href={product.downloadUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-[#FACC15] hover:bg-[#F59E0B] text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        ดาวน์โหลดไฟล์ (Google Drive)
                      </a>
                    ) : (
                      <button disabled className="w-full py-2.5 px-4 bg-gray-800 text-gray-500 font-semibold rounded-lg cursor-not-allowed flex items-center justify-center gap-2 text-sm border border-gray-700">
                        ไม่มีลิงก์ดาวน์โหลด
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {uncategorized.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
              <span className="w-2 h-6 bg-[#FACC15] rounded-full inline-block"></span>
              วิชาอื่นๆ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uncategorized.map(product => (
                  <div key={product.id} className="bg-[#1E293B] border border-gray-700/50 rounded-xl p-5 hover:border-[#FACC15]/50 transition-colors flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-md">{product.grade}</span>
                      <span className="text-xs text-gray-500 font-mono">{product.id}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex-grow">{product.title}</h3>
                    
                    {product.downloadUrl ? (
                      <a 
                        href={product.downloadUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-[#FACC15] hover:bg-[#F59E0B] text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        ดาวน์โหลดไฟล์ (Google Drive)
                      </a>
                    ) : (
                      <button disabled className="w-full py-2.5 px-4 bg-gray-800 text-gray-500 font-semibold rounded-lg cursor-not-allowed flex items-center justify-center gap-2 text-sm border border-gray-700">
                        ไม่มีลิงก์ดาวน์โหลด
                      </button>
                    )}
                  </div>
                ))}
              </div>
          </div>
        )}

      </main>
    </div>
  );
}
