'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/app/actions/order';

export default function Checkout() {
  const [cart, setCart] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [guestEmail, setGuestEmail] = useState('');
  const [slipImage, setSlipImage] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      const totalAmount = parsedCart.reduce((sum: number, item: any) => sum + item.price, 0);
      setTotal(totalAmount);
    }
  }, []);

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
      // Clear cart
      localStorage.removeItem('cart');
      alert(`สั่งซื้อสำเร็จ! รหัสคำสั่งซื้อของคุณคือ ${result.orderNumber} (รอแอดมินตรวจสอบสลิปสักครู่นะครับ)`);
      router.push('/store');
      router.refresh();
    }
  };

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
                  <h3 style={{ fontSize: '1.1rem', color: 'white' }}>{item.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.subject} {item.grade}</p>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>
                  ฿{item.price}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--primary)' }}>
            <span style={{ fontSize: '1.5rem', color: 'white' }}>ยอดรวมทั้งสิ้น</span>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>฿{total}</span>
          </div>
        </div>

        {/* Payment & Form */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>บัญชีธนาคารสำหรับโอนเงิน</h2>
          
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.2rem', color: 'white', marginBottom: '0.5rem' }}>ธนาคารกสิกรไทย</p>
            <h3 style={{ fontSize: '2rem', letterSpacing: '2px', color: 'var(--primary)', marginBottom: '0.5rem' }}>123-4-56789-0</h3>
            <p style={{ color: 'var(--text-muted)' }}>ชื่อบัญชี: บจก. แผนการสอน 21</p>
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
