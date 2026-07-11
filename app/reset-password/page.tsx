'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกันครับ');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  if (!token) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary)' }}>ลิงก์ไม่ถูกต้อง หรือหมดอายุแล้ว</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>กรุณาทำการขอรีเซ็ตรหัสผ่านใหม่อีกครั้ง</p>
        <Link href="/forgot-password" style={{ display: 'inline-block', marginTop: '2rem', padding: '1rem 2rem' }} className="btn btn-primary">
          ไปหน้าลืมรหัสผ่าน
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 0', animation: 'fadeIn 0.5s ease-out', maxWidth: '500px', display: 'flex', flexDirection: 'column', minHeight: '60vh', justifyContent: 'center' }}>
      <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>ตั้งรหัสผ่านใหม่</h1>
        
        {!isSuccess ? (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>กรุณากำหนดรหัสผ่านใหม่ของคุณ (ความยาวอย่างน้อย 8 ตัวอักษร)</p>
            
            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #ef4444' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>รหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem' }} 
                />
              </div>
              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>ยืนยันรหัสผ่านใหม่อีกครั้ง</label>
                <input 
                  type="password" 
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem' }} 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.125rem', marginTop: '1rem' }} disabled={isSubmitting}>
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>เปลี่ยนรหัสผ่านสำเร็จ!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              คุณสามารถใช้รหัสผ่านใหม่เพื่อเข้าสู่ระบบได้ทันที
            </p>
            <Link href="/login" className="btn btn-primary" style={{ padding: '1rem 2rem', display: 'inline-block' }}>
              ไปหน้าเข้าสู่ระบบ
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
