'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate sending email
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1000);
  };

  return (
    <div className="container" style={{ padding: '4rem 0', animation: 'fadeIn 0.5s ease-out', maxWidth: '500px', display: 'flex', flexDirection: 'column', minHeight: '60vh', justifyContent: 'center' }}>
      <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>ลืมรหัสผ่าน?</h1>
        
        {!isSent ? (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>กรอกอีเมลที่คุณใช้สมัครสมาชิก ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้ครับ</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'left' }}>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem' }} 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.125rem', marginTop: '1rem' }} disabled={isSubmitting}>
                {isSubmitting ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
            <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '2rem' }}>
              เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปที่ <strong>{email}</strong> แล้วครับ (โปรดเช็กในกล่องจดหมาย หรือ Junk mail)
            </p>
            
            {/* MVP ONLY: Show the link on screen for easy testing */}
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px dashed #10b981', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '0.5rem' }}>*ส่วนนี้แสดงเฉพาะช่วงทดสอบระบบ*</p>
              <Link href={`/reset-password?token=mock-token-for-${email}`} style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>
                คลิกที่นี่เพื่อไปหน้าตั้งรหัสผ่านใหม่ (จำลองการกดจากอีเมล)
              </Link>
            </div>
          </>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Link href="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            &larr; กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}
