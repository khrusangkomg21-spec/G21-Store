'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { useCart } from '../../context/CartContext';

const subjectDb: Record<string, any> = {
  sci: { title: 'วิทยาศาสตร์ สิ่งแวดล้อม และเทคโนโลยี (นักวิทยาศาสตร์น้อย)', icon: '🔬' },
  soc: { title: 'สังคมและความเป็นพลเมือง (ครอบครัวของฉัน)', icon: '🌾' },
  eco: { title: 'เศรษฐกิจและการเงิน (การเรียนรู้เพื่อชีวิต)', icon: '💰' },
  hea: { title: 'สุขภาพกายและจิต (พลศึกษา)', icon: '🩺' },
  art: { title: 'ศิลปะและวัฒนธรรมเพื่อสุนทรียภาพ', icon: '🎨' },
  eng: { title: 'ภาษาอังกฤษ (English)', icon: '🇬🇧' },
};

const standardPackages = [
  { id: 'combo-full', name: 'เซ็ตแผนปกติพร้อมใบงาน + แผนหน้าเดียว + หลังสอน', price: 239, tag: 'คุ้มที่สุด! 👑' },
  { id: 'combo-normal', name: 'เซ็ตแผนปกติพร้อมใบงาน + หลังสอน', price: 199, tag: 'ขายดี 🔥' },
  { id: 'combo-onepage-worksheet', name: 'เซ็ตแผนหน้าเดียว + หลังสอน + ใบงาน', price: 189 },
  { id: 'combo-onepage', name: 'เซ็ตแผนหน้าเดียว + หลังสอน', price: 159 },
  { id: 'single-normal', name: 'แผนการสอน 40 ชั่วโมง + ใบงานพร้อมเฉลย', price: 150 },
  { id: 'single-post', name: 'บันทึกหลังสอน (120 แบบ)', price: 99 },
  { id: 'single-onepage', name: 'แผนหน้าเดียว', price: 89 },
  { id: 'single-worksheet', name: 'ใบงาน PNG ไม่ติดลายน้ำ', price: 79 },
  { id: 'single-exam', name: 'ข้อสอบพร้อมเฉลย', price: 59 },
];

const englishPackages = [
  { id: 'combo-full-eng', name: 'เซ็ตแผนปกติพร้อมใบงาน + แผนหน้าเดียว + หลังสอน', price: 399, tag: 'คุ้มที่สุด! 👑' },
  { id: 'combo-normal-eng', name: 'เซ็ตแผนปกติพร้อมใบงาน + หลังสอน', price: 329, tag: 'ขายดี 🔥' },
  { id: 'combo-onepage-worksheet-eng', name: 'เซ็ตแผนหน้าเดียว + หลังสอน + ใบงาน', price: 299 },
  { id: 'combo-onepage-eng', name: 'เซ็ตแผนหน้าเดียว + หลังสอน', price: 259 },
  { id: 'single-normal-eng', name: 'แผนการสอน 80 ชั่วโมง + ใบงานพร้อมเฉลย', price: 250 },
  { id: 'single-post-eng', name: 'บันทึกหลังสอน', price: 159 },
  { id: 'single-onepage-eng', name: 'แผนหน้าเดียว', price: 149 },
  { id: 'single-worksheet-eng', name: 'ใบงาน PNG ไม่ติดลายน้ำ', price: 129 },
  { id: 'single-exam-eng', name: 'ข้อสอบพร้อมเฉลย', price: 59 },
];

export default function ProductDetails({ params }: { params: { id: string } }) {
  const { id } = params;
  const { addToCart } = useCart();
  const subject = subjectDb[id];
  
  if (!subject) return notFound();

  const currentPackages = id === 'eng' ? englishPackages : standardPackages;
  
  const checkPackageReady = (pkgId: string) => {
    if (id === 'eng') return false;
    if (!['P1', 'P2', 'P3'].includes(selectedGrade)) return false;

    if (pkgId === 'single-normal') return true;
    if (pkgId === 'single-worksheet' && (id === 'sci' || (id === 'eco' && selectedGrade === 'P1'))) return true;
    if (pkgId === 'single-exam') return true;
    if (pkgId === 'single-onepage' && id === 'sci' && ['P1', 'P2'].includes(selectedGrade)) return true;

    return false;
  };

  const [selectedGrade, setSelectedGrade] = useState('P1');
  const [showToast, setShowToast] = useState(false);
  
  const firstAvailable = currentPackages.find(p => checkPackageReady(p.id))?.id || currentPackages[0].id;
  const [selectedPackage, setSelectedPackage] = useState(firstAvailable);

  const activePackage = currentPackages.find(p => p.id === selectedPackage);
  const isReady = checkPackageReady(selectedPackage);

  const handleAddToCart = (pkg: any) => {
    if (!pkg) return;
    const cartItemId = `${id}-${selectedGrade}-${pkg.id}`;
    addToCart({
      id: cartItemId,
      subject: subject.title.split(' ')[0],
      grade: `ป.${selectedGrade.replace('P', '')}`,
      package: pkg.name,
      price: pkg.price,
      icon: subject.icon
    });
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddVIPToCart = () => {
    addToCart({
      id: `vip-p1-p3`,
      subject: 'แพ็กเกจ VIP',
      grade: 'ป.1-3',
      package: 'ครบ จบ ในกลุ่มเดียว (ได้ครบทั้ง 5 วิชาทุกชั้น + แผน + ใบงาน + ข้อสอบ)',
      price: 990,
      icon: '💎'
    });
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const sampleGalleries: Record<string, string[]> = {
    'sci-P1-single-normal': ['/samples/media__1783762433916.jpg', '/samples/media__1783762433921.jpg', '/samples/media__1783762433931.jpg', '/samples/media__1783762433935.jpg', '/samples/media__1783762433952.jpg'],
    'sci-P2-single-normal': ['/samples/media__1783762765626.jpg', '/samples/media__1783762765629.jpg', '/samples/media__1783762765635.jpg', '/samples/media__1783762765644.jpg'],
    'sci-P3-single-normal': ['/samples/media__1783762881489.jpg', '/samples/media__1783762881494.jpg', '/samples/media__1783762881498.jpg', '/samples/media__1783762881504.jpg'],
    'eco-P1-single-normal': ['/samples/media__1783762992348.jpg', '/samples/media__1783762992353.jpg', '/samples/media__1783762992360.jpg', '/samples/media__1783762992363.jpg'],
    'sci-P1-single-worksheet': ['/samples/media__1783762628556.jpg', '/samples/media__1783762628562.jpg', '/samples/media__1783762628566.jpg', '/samples/media__1783762628595.jpg'],
    'sci-P2-single-worksheet': ['/samples/media__1783762808728.jpg', '/samples/media__1783762808736.jpg', '/samples/media__1783762808739.jpg', '/samples/media__1783762808744.jpg'],
    'sci-P3-single-worksheet': ['/samples/media__1783762899853.jpg', '/samples/media__1783762899856.jpg', '/samples/media__1783762899860.jpg', '/samples/media__1783762899865.jpg'],
    'eco-P1-single-worksheet': ['/samples/media__1783763026140.jpg', '/samples/media__1783763026144.jpg', '/samples/media__1783763026148.jpg', '/samples/media__1783763026154.jpg'],
    'single-normal': ['https://placehold.co/400x600/0f172a/10b981?text=Lesson+Plan+1', 'https://placehold.co/400x600/0f172a/10b981?text=Lesson+Plan+2'],
    'single-worksheet': ['https://placehold.co/400x600/0f172a/3b82f6?text=Worksheet+1', 'https://placehold.co/400x600/0f172a/3b82f6?text=Worksheet+2', 'https://placehold.co/400x600/0f172a/3b82f6?text=Worksheet+3'],
    'single-onepage': ['/samples/media__1783762723526.jpg', '/samples/media__1783762723602.jpg', '/samples/media__1783762723608.jpg', '/samples/media__1783762723613.jpg'],
    'sci-P1-single-exam': ['/samples/media__1783763319487.jpg', '/samples/media__1783763319491.jpg', '/samples/media__1783763319494.jpg', '/samples/media__1783763328974.jpg'],
    'sci-P2-single-exam': ['/samples/media__1783763629830.jpg', '/samples/media__1783763629838.jpg', '/samples/media__1783763635346.jpg', '/samples/media__1783763635356.jpg'],
    'sci-P3-single-exam': ['/samples/media__1783763677698.jpg', '/samples/media__1783763677703.jpg', '/samples/media__1783763684160.jpg', '/samples/media__1783763684203.jpg'],
    'soc-P1-single-exam': ['/samples/media__1783763881634.jpg', '/samples/media__1783763881670.jpg', '/samples/media__1783763881673.jpg'],
    'soc-P2-single-exam': ['/samples/media__1783763918886.jpg', '/samples/media__1783763918893.jpg', '/samples/media__1783763926240.jpg', '/samples/media__1783763926246.jpg'],
    'soc-P3-single-exam': ['/samples/media__1783763941893.jpg', '/samples/media__1783763941911.jpg', '/samples/media__1783763951438.jpg', '/samples/media__1783763951439.jpg'],
    'eco-P1-single-exam': ['/samples/media__1783764048204.jpg', '/samples/media__1783764048243.jpg', '/samples/media__1783764054894.jpg', '/samples/media__1783764054896.jpg'],
    'eco-P2-single-exam': ['/samples/media__1783764074140.jpg', '/samples/media__1783764074146.jpg', '/samples/media__1783764083053.jpg', '/samples/media__1783764083057.jpg'],
    'eco-P3-single-exam': ['/samples/media__1783764097501.jpg', '/samples/media__1783764097505.jpg', '/samples/media__1783764109449.jpg', '/samples/media__1783764109451.jpg'],
    'health-P1-single-exam': ['/samples/media__1783764243426.jpg', '/samples/media__1783764243432.jpg', '/samples/media__1783764250811.jpg', '/samples/media__1783764250820.jpg'],
    'health-P2-single-exam': ['/samples/media__1783764263147.jpg', '/samples/media__1783764263220.jpg', '/samples/media__1783764271208.jpg', '/samples/media__1783764271210.jpg'],
    'health-P3-single-exam': ['/samples/media__1783764284627.jpg', '/samples/media__1783764284667.jpg', '/samples/media__1783764290100.jpg', '/samples/media__1783764290101.jpg'],
    'art-P1-single-exam': ['/samples/media__1783764533393.jpg', '/samples/media__1783764533404.jpg', '/samples/media__1783764541275.jpg', '/samples/media__1783764541276.jpg'],
    'art-P2-single-exam': ['/samples/media__1783764565226.jpg', '/samples/media__1783764565230.jpg', '/samples/media__1783764579838.jpg'],
    'art-P3-single-exam': ['/samples/media__1783764579845.jpg', '/samples/media__1783764586582.jpg', '/samples/media__1783764586583.jpg'],
    'single-exam': ['https://placehold.co/400x600/0f172a/ef4444?text=Exam+1', 'https://placehold.co/400x600/0f172a/ef4444?text=Exam+2'],
    'combo-full': ['https://placehold.co/400x600/0f172a/8b5cf6?text=Combo+Preview+1']
  };

  const specificKey = `${id}-${selectedGrade}-${selectedPackage}`;
  const currentGallery = sampleGalleries[specificKey] || sampleGalleries[selectedPackage] || sampleGalleries['single-normal'];

  return (
    <div className="container" style={{ padding: '3rem 0', animation: 'fadeIn 0.5s ease-out', position: 'relative' }}>
      
      {showToast && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '1rem 2rem', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'slideDown 0.3s ease-out' }}>
          <span style={{ fontSize: '1.25rem' }}>✅</span> เพิ่มสินค้าลงตะกร้าแล้ว!
        </div>
      )}

      {/* VIP Banner P1-3 */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'linear-gradient(90deg, #051A11, #1A4731, #051A11)', border: '2px solid var(--primary)', textAlign: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ color: 'var(--primary)', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>💎</span> G21 MEMBERSHIP VIP [ป.1-3]
          </h2>
          <p style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>ครบ จบ ในกลุ่มเดียว (ได้ครบทั้ง 5 วิชาทุกชั้น + แผน + ใบงาน + ข้อสอบ)</p>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '1rem', marginBottom: 0 }}>มูลค่ารวม 5,9XX.- บาท</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem' }}>จ่ายเพียง</span>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>990.-</span>
            </div>
          </div>
          <button onClick={handleAddVIPToCart} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.25rem', boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)', whiteSpace: 'nowrap' }}>
            เพิ่มลงตะกร้า VIP
          </button>
        </div>
      </div>

      {/* VIP Banner P4-6 */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '3rem', background: 'linear-gradient(90deg, #0f172a, #1e293b, #0f172a)', border: '1px solid var(--border-color)', textAlign: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', opacity: 0.8 }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ color: 'var(--text-muted)', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>💎</span> G21 MEMBERSHIP VIP [ป.4-6]
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>รอติดตามเร็วๆ นี้ (ได้ครบทั้ง 5 วิชาทุกชั้น + แผน + ใบงาน + ข้อสอบ)</p>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-muted)', lineHeight: 1 }}>เร็วๆ นี้</span>
            </div>
          </div>
          <button className="btn btn-outline" disabled style={{ padding: '1rem 2rem', fontSize: '1.25rem', cursor: 'not-allowed', color: 'var(--text-muted)' }}>
            Coming Soon
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        <div style={{ flex: '1', minWidth: 'min(100%, 350px)' }}>
          <div className="glass-card" style={{ aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top right, #1A4731, var(--surface))', color: 'var(--primary)', marginBottom: '2rem' }}>
            <div style={{ fontSize: '8rem', textShadow: '0 0 30px rgba(212,175,55,0.4)' }}>{subject.icon}</div>
            <h2 style={{ color: 'var(--text-main)', marginTop: '1rem', textAlign: 'center' }}>{subject.title.split(' ')[0]}</h2>
          </div>

          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>จุดเด่นของผลงาน</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>📝</span>
                <div>
                  <h4 style={{ fontWeight: 600 }}>แก้ไขได้ทุกไฟล์</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>เปิดด้วย Word / PPT แก้ไขง่าย ใช้งานได้ทันที</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                <div>
                  <h4 style={{ fontWeight: 600 }}>ใบงาน PNG ไม่ติดลายน้ำ</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ออกแบบเพื่อเด็กประถม สีสันสบายตา อ่านง่าย</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>👥</span>
                <div>
                  <h4 style={{ fontWeight: 600 }}>บันทึกหลังสอน 120 แบบ</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ปรับใช้ตามศักยภาพผู้เรียน (เก่ง, ปานกลาง, อ่อน)</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>ตัวอย่างผลงาน</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {currentGallery.map((src, idx) => (
                <a 
                  key={idx} 
                  href={src} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ 
                    display: 'block', 
                    width: '100%',
                    aspectRatio: '16/9', 
                    backgroundImage: `url(${src})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'top center', 
                    borderRadius: '0.5rem', 
                    cursor: 'zoom-in', 
                    border: '1px solid var(--border-color)', 
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)' 
                  }}
                ></a>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>*คลิกที่รูปเพื่อขยายใหญ่ (เลื่อนดูรูปเพิ่มเติมได้)</p>
          </div>
          
          <div className="glass-card" style={{ padding: '2rem', background: 'rgba(212, 175, 55, 0.05)', border: '1px solid var(--primary)' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', textAlign: 'center' }}>🎁 ของแถมฟรีในชุด 🎁</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div>❤️ คำอธิบายรายวิชา</div>
              <div>❤️ โครงสร้างรายวิชา</div>
              <div>❤️ กำหนดการสอน</div>
              <div>❤️ แบบประเมิน</div>
            </div>
          </div>
        </div>

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
                const isComingSoon = ['P4', 'P5', 'P6'].includes(grade);
                return (
                  <button 
                    key={grade}
                    onClick={() => !isComingSoon && setSelectedGrade(grade)}
                    className={`btn ${selectedGrade === grade ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, minWidth: '30%', padding: '1rem', display: 'flex', flexDirection: 'column', opacity: isComingSoon ? 0.5 : 1, cursor: isComingSoon ? 'not-allowed' : 'pointer' }}
                    disabled={isComingSoon}
                  >
                    <span style={{ fontSize: '1.25rem' }}>ป.{grade.replace('P', '')}</span>
                    {grade === 'P1' && <span style={{ fontSize: '0.75rem', marginTop: '0.2rem', opacity: 0.8 }}>สีสันสบายตา</span>}
                    {grade === 'P2' && <span style={{ fontSize: '0.75rem', marginTop: '0.2rem', opacity: 0.8 }}>กิจกรรมหลากหลาย</span>}
                    {grade === 'P3' && <span style={{ fontSize: '0.75rem', marginTop: '0.2rem', opacity: 0.8 }}>วิเคราะห์มากขึ้น</span>}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {currentPackages.map(pkg => {
                const isPkgReady = checkPackageReady(pkg.id);
                return (
                <div 
                  key={pkg.id} 
                  onClick={() => isPkgReady && setSelectedPackage(pkg.id)}
                  style={{ 
                    padding: '1.2rem', 
                    border: `2px solid ${selectedPackage === pkg.id ? 'var(--primary)' : 'var(--border-color)'}`,
                    borderRadius: '1rem',
                    cursor: isPkgReady ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: selectedPackage === pkg.id ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                    transition: 'all 0.2s',
                    opacity: isPkgReady ? 1 : 0.4
                  }}
                >
                  <div>
                    <div style={{ fontWeight: selectedPackage === pkg.id ? 700 : 500, fontSize: '1.1rem', color: selectedPackage === pkg.id ? 'var(--primary)' : 'var(--text-main)' }}>
                      {pkg.name} {pkg.tag && <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', background: '#D4AF37', color: '#051A11', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{pkg.tag}</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                    ฿{pkg.price}
                  </div>
                </div>
              )})}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem', borderTop: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ยอดรวม (สำหรับวิชา{subject.title.split(' ')[0]} ชั้น ป.{selectedGrade.replace('P', '')})</p>
                <h2 style={{ fontSize: '2.5rem', lineHeight: 1, color: 'var(--text-main)' }}>฿{activePackage?.price}</h2>
              </div>
              <button 
                onClick={() => handleAddToCart(activePackage)}
                className="btn btn-primary" 
                style={{ padding: '1rem 2.5rem', fontSize: '1.25rem', opacity: isReady ? 1 : 0.5, cursor: isReady ? 'pointer' : 'not-allowed' }}
                disabled={!isReady}
              >
                {isReady ? 'เพิ่มลงตะกร้า' : 'เร็วๆ นี้ (Coming Soon)'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
