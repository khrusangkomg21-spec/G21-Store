import type { Metadata } from 'next'
import { Prompt } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { getSession, logout } from './actions/auth'
import { redirect } from 'next/navigation'

const prompt = Prompt({ subsets: ['thai', 'latin'], weight: ['300', '400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'G21 คลังสื่องานสอน | รองรับหลักสูตรใหม่ 2568',
  description: 'สื่อการสอนพร้อมใช้ ครบ 5 วิชา แผนการสอน ใบงาน ข้อสอบ แผนหน้าเดียว บันทึกหลังสอน',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession();

  return (
    <html lang="th">
      <body className={prompt.className}>
        <nav className="glass-nav">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="text-gradient">
              <span>G21</span> <span style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-main)' }}>คลังสื่องานสอน</span>
            </Link>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link href="/store" style={{ fontWeight: 500, transition: 'color 0.2s' }} className="hover:text-primary">หน้าร้านค้า</Link>
              
              {session ? (
                <>
                  <Link href="/my-files" style={{ fontWeight: 500, color: 'var(--primary)', transition: 'color 0.2s' }} className="hover:text-primary">ไฟล์ของฉัน</Link>
                  {session.role === 'ADMIN' && (
                    <Link href="/admin" style={{ fontWeight: 600, color: '#fbbf24', transition: 'color 0.2s' }}>Admin</Link>
                  )}
                  <span style={{ color: 'var(--border-color)' }}>|</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{session.email as string}</span>
                  
                  {/* ปุ่มออกจากระบบ */}
                  <form action={async () => {
                    'use server';
                    await logout();
                    redirect('/login');
                  }}>
                    <button type="submit" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', padding: '0 0.5rem' }} className="hover:opacity-80">
                      ออกจากระบบ
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <span style={{ color: 'var(--border-color)' }}>|</span>
                  <Link href="/login" style={{ fontWeight: 500, transition: 'color 0.2s' }} className="hover:text-primary">เข้าสู่ระบบ</Link>
                  <Link href="/register" style={{ fontWeight: 500, color: 'var(--primary)', transition: 'opacity 0.2s' }} className="hover:opacity-80">สมัครฟรี</Link>
                </>
              )}
              
              <Link href="/cart" className="btn btn-primary" style={{ marginLeft: '0.5rem' }}>ตะกร้าสินค้า</Link>
            </div>
          </div>
        </nav>
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <footer style={{ borderTop: '1px solid var(--border-color)', padding: '2rem 0', marginTop: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="container">
            <p>&copy; 2026 G21 คลังสื่องานสอน หลักสูตรใหม่ 2568. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
