import Link from 'next/link';

export default function Store() {
  const subjects: { id: string; title: string; desc: string; icon: string; image: string; comingSoon?: boolean }[] = [
    { id: 'sci', title: 'วิทยาศาสตร์ สิ่งแวดล้อม และเทคโนโลยี', desc: 'นักวิทยาศาสตร์น้อย ป.1 - ป.3', icon: '🔬', image: '/sci.jpg' },
    { id: 'soc', title: 'สังคมและความเป็นพลเมือง', desc: 'ครอบครัวของฉัน ป.1 - ป.3', icon: '🌾', image: '/soc.jpg' },
    { id: 'eco', title: 'เศรษฐกิจและการเงิน', desc: 'การเรียนรู้เพื่อชีวิต ป.1 - ป.3', icon: '💰', image: '/eco.jpg' },
    { id: 'hea', title: 'สุขภาพกายและจิต', desc: 'พลศึกษา ป.1 - ป.3', icon: '🩺', image: '/hea.jpg' },
    { id: 'art', title: 'ศิลปะและวัฒนธรรมเพื่อสุนทรียภาพ', desc: 'ศิลปะ ป.1 - ป.3', icon: '🎨', image: '/art.jpg' },
    { id: 'eng', title: 'ภาษาอังกฤษ', desc: 'รายวิชาพื้นฐาน 80 ชม.', icon: '🇬🇧', image: '/eng.jpg' },
  ];

  return (
    <div className="container" style={{ padding: '3rem 0', animation: 'fadeIn 0.5s ease-out' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>หมวดหมู่วิชา</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.2rem' }}>
        แผนการจัดการเรียนรู้ หลักสูตรนำร่อง พุทธศักราช 2568 (ด้านประยุกต์ใช้ในชีวิตประจำวัน 40 ชม.)
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {subjects.map((subject, index) => (
          <div key={subject.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', animation: `slideUp ${0.3 + index * 0.1}s ease-out`, overflow: 'hidden' }}>
            <div style={{ 
              width: '100%',
              aspectRatio: '1 / 1.414', 
              backgroundImage: `url(${subject.image})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'top center', 
              opacity: subject.comingSoon ? 0.7 : 1,
              borderBottom: '3px solid var(--primary)'
            }}></div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', background: 'rgba(0,0,0,0.2)' }}>
              {subject.comingSoon && (
                <span style={{ position: 'absolute', top: '-15px', right: '15px', background: 'var(--text-main)', color: 'var(--bg-color)', padding: '0.2rem 0.8rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
                  เร็วๆ นี้
                </span>
              )}
              {subject.id === 'eng' && (
                <span style={{ position: 'absolute', top: '-15px', right: '15px', background: 'linear-gradient(90deg, #4f46e5, #312e81)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #818cf8', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.4)' }}>
                  ⭐ โปรเจกต์พิเศษ (ไม่รวม VIP)
                </span>
              )}
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: subject.comingSoon ? 'var(--text-muted)' : 'var(--text-main)' }}>{subject.icon} {subject.title}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1 }}>{subject.desc}</p>
              
              <Link href={`/store/${subject.id}`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                เลือกดูชั้นปี & แพ็กเกจ
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
