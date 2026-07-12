'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { getProductsByCategory } from '@/app/actions/product';
import Link from 'next/link';
import { getDirectImageUrl } from '@/lib/imageUtils';

// Category Definitions
const subjectDb: Record<string, any> = {
  sci: { title: 'วิทยาศาสตร์ สิ่งแวดล้อม และเทคโนโลยี (นักวิทยาศาสตร์น้อย)', icon: '🔬' },
  soc: { title: 'สังคมและความเป็นพลเมือง (ครอบครัวของฉัน)', icon: '🌾' },
  eco: { title: 'เศรษฐกิจและการเงิน (การเรียนรู้เพื่อชีวิต)', icon: '💰' },
  hea: { title: 'สุขภาพกายและจิต (พลศึกษา)', icon: '🩺' },
  art: { title: 'ศิลปะและวัฒนธรรมเพื่อสุนทรียภาพ', icon: '🎨' },
  eng: { title: 'ภาษาอังกฤษ (English)', icon: '🇬🇧' },
};

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToCart } = useCart();
  const subject = subjectDb[id];
  
  if (!subject) return notFound();

  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [selectedGrade, setSelectedGrade] = useState('P1');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const data = await getProductsByCategory(id);
      setDbProducts(data);
      setIsLoading(false);
    }
    loadProducts();
    
    import('@/app/actions/auth').then(({ getSession }) => {
      getSession().then(s => setSession(s));
    });
  }, [id]);

  const currentPackages = dbProducts.filter(p => p.grade === selectedGrade);
  
  // Auto-select first package when grade changes
  useEffect(() => {
    if (currentPackages.length > 0) {
      if (!currentPackages.find(p => p.id === selectedPackage)) {
        setSelectedPackage(currentPackages[0].id);
      }
    } else {
      setSelectedPackage('');
    }
  }, [selectedGrade, currentPackages, selectedPackage]);

  const activePackage = currentPackages.find(p => p.id === selectedPackage);

  const isVipP13 = session?.isVip || session?.vipP1ToP3;
  const isVipP46 = session?.vipP4ToP6;
  const isGradeP13 = ['P1', 'P2', 'P3'].includes(selectedGrade);
  const isGradeP46 = ['P4', 'P5', 'P6'].includes(selectedGrade);
  
  const hasVipAccess = subject.id !== 'eng' && (
    (isVipP13 && isGradeP13) || (isVipP46 && isGradeP46)
  );

  const handleAddToCart = (pkg: any) => {
    if (!pkg || !pkg.downloadUrl) return;
    addToCart({
      id: pkg.id,
      subject: subject.title.split(' ')[0],
      grade: `ป.${selectedGrade.replace('P', '')}`,
      package: pkg.title,
      price: pkg.price,
      icon: subject.icon
    });
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const currentGallery = activePackage?.images?.length > 0 
    ? activePackage.images 
    : ['https://placehold.co/400x600/0f172a/10b981?text=ไม่มีรูปภาพตัวอย่าง'];

  return (
    <div className="container" style={{ padding: '3rem 0', animation: 'fadeIn 0.5s ease-out', position: 'relative' }}>
      
      {showToast && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '1rem 2rem', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'slideDown 0.3s ease-out' }}>
          <span style={{ fontSize: '1.25rem' }}>✅</span> เพิ่มสินค้าลงตะกร้าแล้ว!
        </div>
      )}

      {id === 'eng' && (
         <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '3rem', background: 'linear-gradient(90deg, #4f46e5, #312e81, #4f46e5)', border: '2px solid #818cf8', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
           <h2 style={{ color: 'white', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <span>⭐</span> โปรเจกต์พิเศษ: วิชาภาษาอังกฤษ (ไม่ร่วมรายการแพ็กเกจ VIP)
           </h2>
         </div>
      )}

      <div style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Left: Image/Icon & Features */}
        <div style={{ flex: '1', minWidth: 'min(100%, 350px)' }}>
          <div className="glass-card" style={{ aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top right, #1A4731, var(--surface))', color: 'var(--primary)', marginBottom: '2rem' }}>
            <div style={{ fontSize: '8rem', textShadow: '0 0 30px rgba(212,175,55,0.4)' }}>{subject.icon}</div>
            <h2 style={{ color: 'var(--text-main)', marginTop: '1rem', textAlign: 'center' }}>{subject.title.split(' ')[0]}</h2>
          </div>
          
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>ตัวอย่างผลงาน</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {currentGallery.map((src: string, idx: number) => {
                const bgUrl = getDirectImageUrl(src);
                return (
                  <a 
                    key={idx} 
                    href={src} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ 
                      display: 'block', 
                      width: '100%',
                      aspectRatio: '16/9', 
                      backgroundImage: `url("${bgUrl}")`, 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'top center', 
                      borderRadius: '0.5rem', 
                      cursor: 'zoom-in', 
                      border: '1px solid var(--border-color)', 
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)' 
                    }}
                  ></a>
                );
              })}
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>*คลิกที่รูปเพื่อขยายใหญ่ (เลื่อนดูรูปเพิ่มเติมได้)</p>
          </div>
        </div>

        {/* Right: Details & Selection */}
        <div style={{ flex: '1.2', minWidth: 'min(100%, 400px)' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 600, letterSpacing: '1px' }}>หลักสูตรใหม่ 2568 (การประยุกต์ใช้ในชีวิตประจำวัน)</span>
          <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0 1.5rem' }}>{subject.title}</h1>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--primary)', color: 'var(--bg-color)', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>1</span>
              เลือกระดับชั้น
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].map(grade => {
                const hasProducts = dbProducts.some(p => p.grade === grade);
                const isComingSoon = !hasProducts && !isLoading;
                
                return (
                  <button 
                    key={grade}
                    onClick={() => !isComingSoon && setSelectedGrade(grade)}
                    className={`btn ${selectedGrade === grade ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, minWidth: '30%', padding: '1rem', display: 'flex', flexDirection: 'column', opacity: isComingSoon ? 0.5 : 1, cursor: isComingSoon ? 'not-allowed' : 'pointer' }}
                    disabled={isComingSoon}
                  >
                    <span style={{ fontSize: '1.25rem' }}>ป.{grade.replace('P', '')}</span>
                    {isComingSoon && <span style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: '#ef4444', fontWeight: 600 }}>เร็วๆ นี้</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--primary)', color: 'var(--bg-color)', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>2</span>
              เลือกแพ็กเกจ (ราคาต่อชั้น)
            </h3>
            
            {isLoading ? (
              <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดสินค้า...</p>
            ) : currentPackages.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                ยังไม่มีแพ็กเกจสำหรับชั้นนี้ กรุณารอติดตามเร็วๆ นี้
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {currentPackages.map(pkg => (
                  <div 
                    key={pkg.id} 
                    onClick={() => setSelectedPackage(pkg.id)}
                    style={{ 
                      padding: '1.2rem', 
                      border: `2px solid ${selectedPackage === pkg.id ? 'var(--primary)' : 'var(--border-color)'}`,
                      borderRadius: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: selectedPackage === pkg.id ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: selectedPackage === pkg.id ? 700 : 500, fontSize: '1.1rem', color: selectedPackage === pkg.id ? 'var(--primary)' : 'var(--text-main)' }}>
                        {pkg.title} 
                      </div>
                      {pkg.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{pkg.description}</div>
                      )}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                      ฿{pkg.price}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem', borderTop: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ยอดรวม (สำหรับวิชา{subject.title.split(' ')[0]} ชั้น ป.{selectedGrade.replace('P', '')})</p>
                <h2 style={{ fontSize: '2.5rem', lineHeight: 1, color: 'var(--text-main)' }}>
                  ฿{activePackage ? activePackage.price : 0}
                </h2>
              </div>
              {hasVipAccess ? (
                <Link 
                  href={isGradeP13 ? '/vip/p1-3' : '/vip/p4-6'} 
                  className="btn btn-outline" 
                  style={{ 
                    padding: '1rem 2.5rem', 
                    fontSize: '1.25rem', 
                    borderColor: '#10b981', 
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.1)'
                  }}
                >
                  ⭐ มีสิทธิ์ใช้งานแล้วในห้อง VIP
                </Link>
              ) : (
                <button 
                  onClick={() => handleAddToCart(activePackage)}
                  className="btn btn-primary" 
                  style={{ 
                    padding: '1rem 2.5rem', 
                    fontSize: '1.25rem', 
                    opacity: (activePackage && activePackage.downloadUrl) ? 1 : 0.5, 
                    cursor: (activePackage && activePackage.downloadUrl) ? 'pointer' : 'not-allowed' 
                  }}
                  disabled={!activePackage || !activePackage.downloadUrl}
                >
                  {activePackage && !activePackage.downloadUrl ? 'ยังไม่พร้อมจำหน่าย' : 'เพิ่มลงตะกร้า'}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
