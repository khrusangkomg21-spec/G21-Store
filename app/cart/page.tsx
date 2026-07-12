'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { getActivePromoDiscount } from '@/lib/promotions';

export default function Cart() {
  const { cart, removeFromCart, getCartTotal } = useCart();

  const subtotal = getCartTotal();
  const promo = getActivePromoDiscount(subtotal);
  const discountRate = promo ? promo.rate : 0;
  const discountAmount = promo ? promo.amount : 0;
  const total = subtotal - discountAmount;

  return (
    <div className="container" style={{ padding: '3rem 0', animation: 'fadeIn 0.5s ease-out' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>ตะกร้าสินค้า</h1>
      
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Cart Items List */}
        <div style={{ flex: '1.5', minWidth: '300px' }}>
          {cart.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map(item => (
                <div key={item.id} className="glass-card" style={{ display: 'flex', padding: '1.5rem', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '3rem', background: 'rgba(212, 175, 55, 0.1)', padding: '1rem', borderRadius: '1rem' }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>{item.subject} {item.grade !== 'ป.' && `(ชั้น ${item.grade})`}</div>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{item.package}</h3>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>&times;</span> ลบออก
                    </button>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    ฿{item.price}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '1rem' }}>ไม่มีสินค้าในตะกร้า</p>
              <Link href="/store" className="btn btn-primary">ไปเลือกซื้อแผนการสอน</Link>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="glass-card" style={{ flex: '1', minWidth: '300px', padding: '2rem', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>สรุปคำสั่งซื้อ</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>ยอดรวม ({cart.length} รายการ)</span>
            <span>฿{subtotal}</span>
          </div>

          {promo && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--primary)', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{promo.name} ลด {promo.rate * 100}%</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>- ฿{Math.floor(discountAmount)}</span>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>ยอดสุทธิ</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>฿{Math.floor(total)}</span>
          </div>

          <Link href="/checkout" className={`btn btn-primary ${cart.length === 0 ? 'disabled' : ''}`} style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', opacity: cart.length === 0 ? 0.5 : 1, pointerEvents: cart.length === 0 ? 'none' : 'auto' }}>
            ดำเนินการชำระเงิน
          </Link>
          
          {/* Upsell Promo - Check if today is a promo day first */}
          {getActivePromoDiscount(1000) && subtotal > 0 && subtotal < 500 && (
            <div style={{ textAlign: 'center', marginTop: '1rem', background: 'rgba(212, 175, 55, 0.05)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px dashed var(--primary)' }}>
              {subtotal < 100 ? (
                <p style={{ color: 'var(--primary)', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>
                  🔥 โปรพิเศษวันนี้! ซื้อให้ครบ 100.- รับส่วนลด 12% ทันที
                </p>
              ) : (
                <p style={{ color: 'var(--primary)', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>
                  🔥 ช้อปเพิ่มอีก ฿{500 - subtotal} รับส่วนลดเพิ่มเป็น 21% ไปเลย!
                </p>
              )}
            </div>
          )}

          {/* Contact Support Info */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0, 195, 0, 0.05)', border: '1px solid #00c300', borderRadius: '1rem', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: '#00c300', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <svg style={{ width: '28px', height: '28px', color: 'white' }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 3.53 8.871 8.435 9.582.336.071.79.227.905.518.106.262.035.666-.012 1.054-.06.467-.384 2.29-.467 2.808-.106.666.49 1.103.951.815.356-.226 2.083-1.258 5.485-3.805 3.123-2.33 4.704-5.357 4.704-8.497z"/>
              </svg>
            </div>
            <p style={{ color: 'white', fontSize: '1.05rem', marginBottom: '1rem', fontWeight: 500 }}>
              ติดปัญหาหรือต้องการความช่วยเหลือ?
            </p>
            <a 
              href="https://line.me/R/ti/p/@044aapxp" 
              target="_blank" 
              rel="noreferrer"
              className="btn" 
              style={{ display: 'inline-block', width: '100%', background: '#00c300', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '1rem', border: 'none', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(0, 195, 0, 0.3)' }}
            >
              ติดต่อแอดมินผ่าน LINE
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
