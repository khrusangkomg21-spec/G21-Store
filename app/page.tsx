import Link from 'next/link';

export default function Home() {
  const featuredProducts = [
    { id: 'sci-p1', title: 'แผนการสอน วิทยาศาสตร์ ป.1 (หลักสูตร 2568)', price: 239, category: 'วิทยาศาสตร์', image: 'https://placehold.co/600x400/0A2B1D/D4AF37?text=SCI+P1' },
    { id: 'soc-p2', title: 'แผนการสอน สังคมฯ ป.2 (หลักสูตร 2568)', price: 199, category: 'สังคมและความเป็นพลเมือง', image: 'https://placehold.co/600x400/0A2B1D/D4AF37?text=SOC+P2' },
    { id: 'eco-p3', title: 'แผนการสอน เศรษฐศาสตร์ ป.3 (หลักสูตร 2568)', price: 189, category: 'เศรษฐกิจและการเงิน', image: 'https://placehold.co/600x400/0A2B1D/D4AF37?text=ECO+P3' },
    { id: 'eng-p1', title: 'แผนการสอน ภาษาอังกฤษ ป.1 (หลักสูตร 2568)', price: 399, category: 'ภาษาอังกฤษ', image: 'https://placehold.co/600x400/0A2B1D/D4AF37?text=ENG+P1' },
  ];

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
        {/* Decorative Tech Rings (Simulating the cover image background) */}
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

      {/* Featured Products */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>แผนการสอนแนะนำ</h2>
              <p style={{ color: 'var(--text-muted)' }}>จัดเซ็ตคอมโบสุดคุ้ม ประหยัดเวลาอาจารย์ 100%</p>
            </div>
            <Link href="/store" style={{ color: 'var(--primary)', fontWeight: 600 }}>ดูวิชาทั้งหมด &rarr;</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {featuredProducts.map((product, index) => (
              <a href={`/store/${product.id.split('-')[0]}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', animation: `slideUp ${0.5 + index * 0.1}s ease-out`, height: '100%', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(212,175,55,0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ height: '200px', backgroundImage: `url(${product.image})`, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid var(--border-color)', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}></div>
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}>{product.category}</span>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', flex: 1 }}>{product.title}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>฿{product.price}</span>
                      <span className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>ดูรายละเอียด</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
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
