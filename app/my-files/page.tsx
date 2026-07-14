'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyFiles } from '@/app/actions/user';
import Link from 'next/link';
import { getDirectImageUrl } from '@/lib/imageUtils';

export default function MyFiles() {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadFiles() {
      try {
        const data = await getMyFiles();
        setFiles(data);
      } catch (err: any) {
        setError(err.message);
        setTimeout(() => router.push('/login'), 2000);
      } finally {
        setIsLoading(false);
      }
    }
    loadFiles();
  }, [router]);

  if (isLoading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
        <p>กำลังพากลับไปหน้าล็อกอิน...</p>
      </div>
    );
  }

  const formatCategory = (cat: string) => {
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
    return subjectNames[cat] || cat;
  };

  const formatGrade = (grade: string) => {
    if (!grade) return '';
    return grade.replace('P', 'ป.');
  };

  const categoryMap: Record<string, typeof files> = {
    'soc': [],
    'math': [],
    'sci': [],
    'thai': [],
    'hist': [],
    'hea': [],
    'eco': [],
    'art': [],
    'eng': [],
  };

  const uncategorized: typeof files = [];

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

  files.forEach(f => {
    const cat = normalizeCat(f.category);
    if (categoryMap[cat]) {
      categoryMap[cat].push(f);
    } else {
      uncategorized.push(f);
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
    <div className="container" style={{ padding: '2rem 0', animation: 'fadeIn 0.5s ease-out', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--primary)' }}>ไฟล์ของฉัน</h1>
      
      {files.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>ยังไม่มีไฟล์งานที่ได้รับการอนุมัติ</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>เมื่อแอดมินตรวจสอบสลิปและอนุมัติแล้ว ไฟล์งานจะแสดงที่นี่</p>
          <Link href="/store" className="btn btn-primary">
            ไปดูแผนการสอนเพิ่มเติม
          </Link>
        </div>
      ) : (
        <div>
          {Object.entries(categoryMap).map(([cat, items]) => {
            if (items.length === 0) return null;
            const sortedItems = sortItems(items);
            return (
              <div key={cat} style={{ marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ width: '6px', height: '24px', background: 'var(--primary)', borderRadius: '4px' }}></span>
                  วิชา{formatCategory(cat)}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                  {sortedItems.map((file) => (
                    <div key={file.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                      {file.images && file.images.length > 0 ? (
                        <div style={{ height: '180px', borderRadius: '0.5rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
                          <img src={getDirectImageUrl(file.images[0])} alt={file.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                          <svg style={{ width: '64px', height: '64px', color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>วิชา{formatCategory(file.category)} {formatGrade(file.grade)}</h3>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, fontWeight: 500 }}>แพ็กเกจ: {file.title}</p>
                      
                      {file.downloadUrl ? (
                        <a href={file.downloadUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          ดาวน์โหลดไฟล์
                        </a>
                      ) : (
                        <button disabled className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', cursor: 'not-allowed' }}>
                          กำลังเตรียมไฟล์...
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
                {sortItems(uncategorized).map((file) => (
                  <div key={file.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    {file.images && file.images.length > 0 ? (
                      <div style={{ height: '180px', borderRadius: '0.5rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
                        <img src={getDirectImageUrl(file.images[0])} alt={file.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                        <svg style={{ width: '64px', height: '64px', color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>วิชา{formatCategory(file.category)} {formatGrade(file.grade)}</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, fontWeight: 500 }}>แพ็กเกจ: {file.title}</p>
                    
                    {file.downloadUrl ? (
                      <a href={file.downloadUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        ดาวน์โหลดไฟล์
                      </a>
                    ) : (
                      <button disabled className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', cursor: 'not-allowed' }}>
                        กำลังเตรียมไฟล์...
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
