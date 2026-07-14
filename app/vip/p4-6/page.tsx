import { redirect } from 'next/navigation';
import { getSession } from '@/app/actions/auth';
import prisma from '@/lib/prisma';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import { getDirectImageUrl } from '@/lib/imageUtils';

export const metadata = {
  title: 'ห้องลับ VIP ป.4-6 | G21 Lesson Plan Store',
  description: 'ดาวน์โหลดไฟล์สื่อการสอนสำหรับลูกค้า VIP',
};

export default async function VIPRoomP46() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (!session.vipP4ToP6) {
    // If logged in but not VIP P4-6, redirect to home
    redirect('/');
  }

  // Fetch products that are active, not english, not combo, and grade is P4, P5, P6
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      grade: { in: ['P4', 'P5', 'P6'] },
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

  const subjectNames: Record<string, string> = {
    'sci': 'วิทยาศาสตร์ สิ่งแวดล้อม และเทคโนโลยี',
    'soc': 'สังคมและความเป็นพลเมือง',
    'eco': 'เศรษฐกิจและการเงิน',
    'hea': 'สุขภาพกายและจิต',
    'art': 'ศิลปะและวัฒนธรรมเพื่อสุนทรีภาพ',
    'eng': 'ภาษาอังกฤษ',
    'math': 'คณิตศาสตร์',
    'thai': 'ภาษาไทย',
    'hist': 'ประวัติศาสตร์'
  };

  const categoryMap: Record<string, typeof products> = {
    'soc': [],
    'math': [],
    'sci': [],
    'thai': [],
    'hist': [],
    'hea': [],
    'eco': [],
    'art': [],
  };

  const uncategorized: typeof products = [];

  const normalizeCat = (cat: string) => {
    if (!cat) return '';
    if (cat === 'วิทยาศาสตร์') return 'sci';
    if (cat === 'สังคมศึกษา' || cat === 'สังคม' || cat === 'สังคมและความเป็นพลเมือง') return 'soc';
    if (cat === 'เศรษฐศาสตร์' || cat === 'เศรษฐกิจและการเงิน') return 'eco';
    if (cat === 'สุขศึกษา' || cat === 'สุขภาพกายและจิต') return 'hea';
    if (cat === 'ศิลปะ' || cat === 'ศิลปะและวัฒนธรรมเพื่อสุนทรีภาพ') return 'art';
    if (cat === 'ภาษาอังกฤษ') return 'eng';
    if (cat === 'คณิตศาสตร์') return 'math';
    if (cat === 'ภาษาไทย') return 'thai';
    if (cat === 'ประวัติศาสตร์') return 'hist';
    return cat;
  };

  products.forEach(p => {
    const cat = normalizeCat(p.category);
    if (categoryMap[cat]) {
      categoryMap[cat].push(p);
    } else {
      uncategorized.push(p);
    }
  });

  const sortItems = (items: any[]) => {
    return [...items].sort((a, b) => {
      const gradeOrder: Record<string, number> = { 'P1': 1, 'P2': 2, 'P3': 3, 'P4': 4, 'P5': 5, 'P6': 6 };
      const gradeA = gradeOrder[a.grade] || 99;
      const gradeB = gradeOrder[b.grade] || 99;
      if (gradeA !== gradeB) return gradeA - gradeB;
      return (a.title || '').localeCompare(b.title || '', 'th');
    });
  };

  return (
    <div className="container" style={{ padding: '2rem 0', minHeight: '80vh', animation: 'fadeIn 0.5s ease-out' }}>
      <div className="glass-card" style={{ padding: '3rem 2rem', marginBottom: '3rem', background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.2), var(--surface))', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '2.5rem' }}>💎</span>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: 0 }}>ยินดีต้อนรับสู่ห้อง VIP [ป.4 - ป.6]</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', margin: 0 }}>
          คุณสามารถดาวน์โหลดสื่อการสอนทั้งหมด (5 วิชาหลัก ยกเว้นภาษาอังกฤษและคอมโบเซ็ต) ได้ฟรีทันทีจากหน้านี้ค่ะ
        </p>
      </div>

      {Object.entries(categoryMap).map(([cat, items]) => {
        if (items.length === 0) return null;
        const catName = subjectNames[cat] || cat;
        const sortedItems = sortItems(items);
        return (
          <div key={cat} style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ width: '6px', height: '24px', background: 'var(--primary)', borderRadius: '4px' }}></span>
              วิชา{catName}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {sortedItems.map((product: any) => (
                <div key={product.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  {product.images && product.images.length > 0 ? (
                    <div style={{ height: '180px', borderRadius: '0.5rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
                      <img src={getDirectImageUrl(product.images[0])} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                      <svg style={{ width: '64px', height: '64px', color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                  
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>วิชา{catName} {product.grade.replace('P', 'ป.')}</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, fontWeight: 500 }}>แพ็กเกจ: {product.title}</p>
                  
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
            {sortItems(uncategorized).map((product: any) => (
              <div key={product.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                {product.images && product.images.length > 0 ? (
                  <div style={{ height: '180px', borderRadius: '0.5rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
                    <img src={getDirectImageUrl(product.images[0])} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                    <svg style={{ width: '64px', height: '64px', color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                )}
                
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>วิชา{subjectNames[product.category] || product.category} {product.grade.replace('P', 'ป.')}</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, fontWeight: 500 }}>แพ็กเกจ: {product.title}</p>
                
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
