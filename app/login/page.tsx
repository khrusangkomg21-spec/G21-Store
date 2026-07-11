'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState('');
  const router = useRouter();

  const handleAction = async (formData: FormData) => {
    setError('');
    setIsSubmitting(true);
    
    const result = await login(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      router.push('/store');
      router.refresh();
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 0', animation: 'fadeIn 0.5s ease-out', maxWidth: '500px', display: 'flex', flexDirection: 'column', minHeight: '60vh', justifyContent: 'center' }}>
      <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>เข้าสู่ระบบ</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>เพื่อเข้าถึงคลังสื่องานสอนของคุณ</p>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #ef4444' }}>
            {error}
          </div>
        )}

        <form action={handleAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>อีเมล</label>
            <input 
              type="email" 
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem' }} 
            />
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ color: 'var(--text-muted)' }}>รหัสผ่าน</label>
              <Link href="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>ลืมรหัสผ่าน?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '1rem', paddingRight: '3rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem' }} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
                title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.125rem', marginTop: '1rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>
          ยังไม่มีบัญชีใช่ไหม? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
}
