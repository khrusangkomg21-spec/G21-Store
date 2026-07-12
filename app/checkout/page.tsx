'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/app/actions/order';
import { useCart } from '../context/CartContext';
import { getActivePromoDiscount } from '@/lib/promotions';

export default function Checkout() {
  const { cart, clearCart, getCartTotal } = useCart();
  
  const [guestEmail, setGuestEmail] = useState('');
  const [slipImage, setSlipImage] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [satang, setSatang] = useState(0);
  
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    // Generate random satang (1-99) for decimal matching
    setSatang(Math.floor(Math.random() * 99) + 1);
  }, []);

  const subtotal = getCartTotal();
  const promo = getActivePromoDiscount(subtotal);
  const discountRate = promo ? promo.rate : 0;
  const discountAmount = promo ? promo.amount : 0;
  // total is float (e.g. 500.45)
  const totalBase = subtotal - discountAmount;
  const total = totalBase + (satang / 100);

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
    formData.append('discount', discountAmount.toString());
    formData.append('discountCode', promo ? promo.name : '');
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

          {promo && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--primary)', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{promo.name} ลด {promo.rate * 100}%</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>- ฿{Math.floor(discountAmount)}</span>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--primary)' }}>
            <span style={{ fontSize: '1.5rem', color: 'white' }}>ยอดสุทธิที่ต้องโอน</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>฿{total}</span>
          </div>
        </div>

        {/* Payment & Form */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#eb1e79' }}>💰</span> โอนเข้าบัญชีธนาคารออมสิน
          </h2>
          
          <div style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid var(--primary)', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>กรุณาโอนเงินเข้าบัญชีด้านล่าง</p>

            <div style={{ background: 'rgba(235, 30, 121, 0.1)', border: '1px solid #eb1e79', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem', display: 'inline-block', textAlign: 'left', minWidth: '80%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', background: '#eb1e79', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>G</div>
                <div style={{ color: '#eb1e79', fontWeight: 'bold', fontSize: '1.1rem' }}>ธนาคารออมสิน (GSB)</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '0.25rem' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', letterSpacing: '2px', textAlign: 'center' }}>020434775829</div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText('020434775829');
                    alert('คัดลอกเลขบัญชี 020434775829 แล้ว!');
                  }}
                  title="คัดลอกเลขบัญชี"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  className="hover:bg-white hover:text-black"
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
              </div>
              <div style={{ color: 'var(--text-main)', fontSize: '1rem', textAlign: 'center', marginTop: '0.5rem' }}>ชื่อบัญชี: นางสาวอัจฉรา จุติอมรเลิศ เท่านั้น</div>
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>ด้วยยอดเงินที่ระบุด้านล่าง</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '2.5rem', letterSpacing: '1px', color: 'var(--primary)', margin: 0 }}>{total.toFixed(2)}</h3>
              <span style={{ color: 'var(--text-muted)' }}>บาท</span>
            </div>
            
            <p style={{ color: '#ef4444', fontSize: '1.1rem', fontWeight: 700, marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', display: 'inline-block', padding: '0.5rem 1.5rem', borderRadius: '1rem' }}>
              * โอนยอด {total.toFixed(2)} บาท ถ้วนเท่านั้น
            </p>
            
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)' }}>
              <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 500 }}>
                โอนแล้ว กดปุ่มด้านล่างเพื่อตรวจสอบยอดเงินทันที
              </p>
              <button 
                type="button"
                onClick={async () => {
                  if (cart.length === 0) return;
                  setIsSubmitting(true);
                  const formData = new FormData();
                  formData.append('cart', JSON.stringify(cart));
                  formData.append('totalAmount', total.toString());
                  formData.append('discount', discountAmount.toString());
                  formData.append('discountCode', promo ? promo.name : '');
                  // Mock slip file for auto verification
                  const mockBlob = new Blob(['mock slip'], { type: 'image/png' });
                  formData.append('slip', mockBlob, 'auto-verified.png');
                  if (guestEmail) formData.append('guestEmail', guestEmail);
                  
                  const result = await createOrder(formData);
                  if (result.error) {
                    setError(result.error);
                    setIsSubmitting(false);
                  } else {
                    clearCart();
                    alert(`✅ ยืนยันยอดเงิน ${total.toFixed(2)} บาท สำเร็จ! (ระบบจำลอง)\\n\\nรหัสคำสั่งซื้อ: ${result.orderNumber}\\nลิงก์ดาวน์โหลดจะถูกส่งไปที่อีเมลของคุณ`);
                    router.push('/store');
                    router.refresh();
                  }
                }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#10b981', border: 'none' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'กำลังตรวจสอบ...' : 'ตรวจสอบยอดเงินอัตโนมัติ (Mock)'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <span style={{ background: 'var(--surface)', padding: '0 1rem', color: 'var(--text-muted)' }}>หรือ แจ้งโอนแบบแนบสลิปด้วยตนเอง</span>
            <hr style={{ borderColor: 'var(--border-color)', marginTop: '-0.75rem' }} />
          </div>

          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>แจ้งโอนด้วยตนเอง</h2>

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
