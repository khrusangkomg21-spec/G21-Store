'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/app/actions/order';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { cart, clearCart, getCartTotal } = useCart();
  
  const [guestEmail, setGuestEmail] = useState('');
  const [slipImage, setSlipImage] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = getCartTotal();
  let discountRate = 0;
  if (subtotal >= 1000) discountRate = 0.15;
  else if (subtotal >= 500) discountRate = 0.10;
  const discount = Math.floor(subtotal * discountRate);
  const total = subtotal - discount;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipImage(file);
      const objectUrl = URL.createObjectURL(file);
      setSlipPreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (cart.length === 0) {
      setError('ไม่มีสินค้าในตะกร้า');
      return;
    }
    
    if (!slipImage) {
      setError('กรุณาแนบสลิปโอนเงิน');
      return;
    }

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('cart', JSON.stringify(cart));
    formData.append('totalAmount', total.toString());
    formData.append('slip', slipImage);
    if (guestEmail) {
      formData.append('guestEmail', guestEmail);
    }

    const result = await createOrder(formData);
    
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      clearCart();
      alert(`สั่งซื้อสำเร็จ! รหัสคำสั่งซื้อของคุณคือ ${result.orderNumber} (รอแอดมินตรวจสอบสลิปสักครู่นะครับ)`);
      router.push('/store');
      router.refresh();
    }
  };

  // ป้องกัน UI กระพริบก่อนดึงข้อมูลตะกร้าเสร็จ
  if (!mounted) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center', minHeight: '60vh' }}>กำลังโหลดข้อมูล...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>ตะกร้าสินค้า</h1>
        <p style={{ color: 'var(--text-muted)' }}>ยังไม่มีสินค้าในตะกร้า</p>
        <Link href="/store" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
          ไปเลือกซื้อแผนการสอน
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 0', animation: 'fadeIn 0.5s ease-out' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--primary)', textAlign: 'center' }}>
        ชำระเงินและแจ้งโอน
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Cart Summary */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>สรุปคำสั่งซื้อ</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {cart.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'white' }}>{item.package || (item as any).name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.subject} {item.grade !== 'ป.' && `(ชั้น ${item.grade})`}</p>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>
                  ฿{item.price}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>ยอดรวม ({cart.length} รายการ)</span>
            <span style={{ fontSize: '1.25rem', color: 'white' }}>฿{subtotal}</span>
          </div>

          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
              <span style={{ color: '#10b981', fontWeight: 600 }}>ส่วนลด {discountRate * 100}% (ซื้อครบ {discountRate === 0.15 ? '1,000.-' : '500.-'})</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>- ฿{discount}</span>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--primary)' }}>
            <span style={{ fontSize: '1.5rem', color: 'white' }}>ยอดสุทธิที่ต้องโอน</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>฿{total}</span>
          </div>
        </div>

        {/* Payment & Form */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>บัญชีธนาคารสำหรับโอนเงิน</h2>
          
          <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--primary)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: '#eb178b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>GSB</div>
            <p style={{ fontSize: '1.2rem', color: 'white', marginBottom: '0.5rem' }}>ธนาคารออมสิน (GSB)</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '2.2rem', letterSpacing: '1px', color: 'var(--primary)', margin: 0 }}>020434775829</h3>
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('020434775829');
                  alert('คัดลอกเลขบัญชี 020434775829 แล้ว!');
                }}
                style={{ background: 'var(--primary)', color: 'var(--bg-color)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
              >
                คัดลอกเลขบัญชี
              </button>
            </div>
            <p style={{ color: '#ef4444', fontSize: '1.1rem', fontWeight: 700, marginTop: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', display: 'inline-block', padding: '0.2rem 1rem', borderRadius: '1rem' }}>
              ชื่อบัญชี: นางสาวอัจฉรา จุติอมรเลิศ เท่านั้น!
            </p>
            
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span>⏰</span> เวลาทำการตรวจสลิป: <strong style={{ color: 'white' }}>08.00 - 22.00 น.</strong>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* For Guest */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                อีเมลสำหรับรับลิงก์ไฟล์ (หากไม่ได้ล็อกอิน)
              </label>
              <input 
                type="email" 
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="name@example.com"
                style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem' }} 
              />
            </div>

            {/* File Upload */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                แนบสลิปโอนเงิน (สลิปเต็มใบ) *
              </label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  width: '100%', height: '200px', borderRadius: '0.5rem', 
                  border: '2px dashed var(--primary)', background: 'rgba(59, 130, 246, 0.05)', 
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                  cursor: 'pointer', overflow: 'hidden', position: 'relative'
                }}
              >
                {slipPreview ? (
                  <img src={slipPreview} alt="Slip preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <>
                    <svg style={{ width: '40px', height: '40px', color: 'var(--primary)', marginBottom: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span style={{ color: 'var(--text-muted)' }}>คลิกเพื่ออัปโหลดรูปภาพสลิป</span>
                  </>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }} 
              />
            </div>
            
            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ef4444' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ padding: '1.25rem', fontSize: '1.25rem', marginTop: '1rem', width: '100%' }} disabled={isSubmitting}>
              {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการชำระเงิน'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
