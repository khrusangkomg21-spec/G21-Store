import { redirect } from 'next/navigation';
import { getSession } from '@/app/actions/auth';
import prisma from '@/lib/prisma';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import { getDirectImageUrl } from '@/lib/imageUtils';

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
    <div className="container" style={{ padding: '2rem 0', minHeight: '80vh', animation: 'fadeIn 0.5s ease-out' }}>
      <div className="glass-card" style={{ padding: '3rem 2rem', marginBottom: '3rem', background: 'radial-gradient(circle at top right, rgba(212, 175, 55, 0.2), var(--surface))', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '2.5rem' }}>👑</span>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: 0 }}>ยินดีต้อนรับสู่ห้อง VIP [ป.1 - ป.3]</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', margin: 0 }}>
          คุณสามารถดาวน์โหลดสื่อการสอนทั้งหมด (5 วิชาหลัก ยกเว้นภาษาอังกฤษและคอมโบเซ็ต) ได้ฟรีทันทีจากหน้านี้ค่ะ
        </p>
      </div>

      {Object.entries(categoryMap).map(([cat, items]) => {
        if (items.length === 0) return null;
        return (
          <div key={cat} style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ width: '6px', height: '24px', background: 'var(--primary)', borderRadius: '4px' }}></span>
              {cat}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {items.map((product: any) => (
                <div key={product.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  {product.images && product.images.length > 0 ? (
                    <div style={{ height: '180px', borderRadius: '0.5rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
                      <img src={getDirectImageUrl(product.images[0])} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                      <svg style={{ width: '64px', height: '64px', color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ background: 'var(--border-color)', color: 'var(--text-main)', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '0.25rem' }}>{product.grade}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.id}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', flex: 1 }}>{product.title}</h3>
                  
                  {product.downloadUrl ? (
                    <a href={product.downloadUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      ดาวน์โหลดไฟล์ (Drive)
                    </a>
                  ) : (
                    <button disabled className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', cursor: 'not-allowed' }}>
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
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ width: '6px', height: '24px', background: 'var(--primary)', borderRadius: '4px' }}></span>
            วิชาอื่นๆ
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {uncategorized.map((product: any) => (
              <div key={product.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                {product.images && product.images.length > 0 ? (
                  <div style={{ height: '180px', borderRadius: '0.5rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
                    <img src={getDirectImageUrl(product.images[0])} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                    <svg style={{ width: '64px', height: '64px', color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ background: 'var(--border-color)', color: 'var(--text-main)', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '0.25rem' }}>{product.grade}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.id}</span>
                </div>
                
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', flex: 1 }}>{product.title}</h3>
                
                {product.downloadUrl ? (
                  <a href={product.downloadUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    ดาวน์โหลดไฟล์ (Drive)
                  </a>
                ) : (
                  <button disabled className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', cursor: 'not-allowed' }}>
                    ไม่มีลิงก์ดาวน์โหลด
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
