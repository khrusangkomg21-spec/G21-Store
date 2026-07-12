'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { logout } from '../actions/auth';

export default function Navbar({ session }: { session: any }) {
  const { cart } = useCart();
  
  // Calculate total items (max 1 per item since it's digital goods, but we sum quantities just in case)
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
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
              <form action={logout}>
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
          
          <Link href="/cart" className="btn btn-primary" style={{ marginLeft: '0.5rem', position: 'relative' }}>
            ตะกร้าสินค้า
            {cartItemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                padding: '0.1rem 0.5rem',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
