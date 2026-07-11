'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/app/actions/order';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const [guestEmail, setGuestEmail] = useState('');
  const [slipImage, setSlipImage] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const total = getCartTotal();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipImage(file);
      const objectUrl = URL.createObjectURL(file);
      setSlipPreview(objectUrl);
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('020434775829');
    setCopyStatus('คัดลอกสำเร็จ!');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  // ฟังก์ชันย่อขนาดและแปลงรูปให้เป็น Base64
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // บีบอัดเป็น JPEG ขนาดเบาๆ
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
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
    
    try {
      const base64Slip = await compressImage(slipImage);
      
      const formData = new FormData();
      formData.append('cart', JSON.stringify(cart));
      formData.append('totalAmount', total.toString());
      formData.append('slipBase64', base64Slip);
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
    } catch (err) {
      console.error(err);
      setError('ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง');
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) return null;

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
                  <h3 style={{ fontSize: '1.1rem', color: 'white' }}>{item.package}</h3>
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
          
          {/* Bank Account Details */}
          <div style={{ background: 'rgba(236, 72, 153, 0.05)', border: '1px solid #eb1e63', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '24px', height: '24px', background: '#eb1e63', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>อ</div>
              <p style={{ fontSize: '1.2rem', color: '#eb1e63', fontWeight: 600, margin: 0 }}>ธนาคารออมสิน</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '2.2rem', letterSpacing: '2px', color: 'white', margin: 0 }}>020434775829</h3>
              <button 
                type="button"
                onClick={handleCopyAccount}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderColor: '#eb1e63', color: '#eb1e63', minWidth: '100px', background: copyStatus ? 'rgba(236, 72, 153, 0.1)' : 'transparent' }}
              >
                {copyStatus || '📋 คัดลอก'}
              </button>
            </div>
            
            <p style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1rem' }}>ชื่อบัญชี: <span style={{ fontWeight: 700 }}>นางสาวอัจฉรา จุติอมรเลิศ</span></p>
            
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px dashed #ef4444', padding: '1rem', borderRadius: '0.5rem' }}>
              <p style={{ color: '#ef4444', fontWeight: 700, margin: 0, fontSize: '1.05rem', lineHeight: '1.5' }}>
                ⚠️ กรุณาตรวจสอบชื่อบัญชีให้ตรงกับ <br/>"นางสาวอัจฉรา จุติอมรเลิศ" <br/>ชื่อนี้ชื่อเดียวเท่านั้น!
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
