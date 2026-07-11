import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Hero Section */}
      <section style={{ 
        padding: '6rem 0', 
        textAlign: 'center', 
        background: 'radial-gradient(circle at center, #0a3a28 0%, var(--bg-color) 70%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Tech Rings */}
        <div style={{ position: 'absolute', top: '50%', left: '10%', transform: 'translateY(-50%)', width: '300px', height: '300px', borderRadius: '50%', border: '1px solid rgba(212, 175, 55, 0.2)', boxShadow: '0 0 50px rgba(212, 175, 55, 0.1)' }}></div>
        <div style={{ position: 'absolute', top: '50%', left: '5%', transform: 'translateY(-50%)', width: '400px', height: '400px', borderRadius: '50%', border: '1px dashed rgba(212, 175, 55, 0.1)' }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-block', padding: '0.5rem 1.5rem', border: '1px solid var(--primary)', borderRadius: '99px', color: 'var(--primary)', marginBottom: '2rem', fontSize: '0.875rem', letterSpacing: '1px' }}>
            THAILAND CURRICULUM HUB 2568
          </div>
          
          <h1 style={{ fontSize: '4.5rem', marginBottom: '1rem', animation: 'slideUp 0.6s ease-out', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '5rem', color: 'var(--primary)' }}>📖</span>
            <span>G21 <span className="text-gradient">คลังสื่องานสอน</span></span>
          </h1>
          
          <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.5rem', animation: 'slideUp 0.7s ease-out' }}>
            รองรับหลักสูตรใหม่ 2568
          </h2>
          <p style={{ fontSize: '1.5rem', color: 'var(--primary)', maxWidth: '800px', margin: '0 auto 2.5rem', animation: 'slideUp 0.8s ease-out', fontWeight: 300 }}>
            สื่อการสอนพร้อมใช้ ครบ 5 วิชา
          </p>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', animation: 'slideUp 0.9s ease-out', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
               <span style={{ color: 'var(--primary)' }}>✔</span> แผนการสอน
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
               <span style={{ color: 'var(--primary)' }}>✔</span> ใบงาน
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
               <span style={{ color: 'var(--primary)' }}>✔</span> ข้อสอบ
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
               <span style={{ color: 'var(--primary)' }}>✔</span> แผนหน้าเดียว
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
               <span style={{ color: 'var(--primary)' }}>✔</span> บันทึกหลังสอน
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', animation: 'slideUp 1s ease-out' }}>
            <Link href="/store" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🛒</span> เข้าสู่ร้านค้าหลัก
            </Link>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
