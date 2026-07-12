'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyFiles } from '@/app/actions/user';
import Link from 'next/link';

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {files.map((file) => (
            <div key={file.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <svg style={{ width: '64px', height: '64px', color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{file.name}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1 }}>{file.subject} {file.grade}</p>
              
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
      )}
    </div>
  );
}
