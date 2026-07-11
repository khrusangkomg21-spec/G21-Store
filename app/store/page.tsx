import Link from 'next/link';

export default function Store() {
  const subjects: { id: string; title: string; desc: string; icon: string; image: string; comingSoon?: boolean }[] = [
    { id: 'sci', title: 'วิทยาศาสตร์ สิ่งแวดล้อม และเทคโนโลยี', desc: 'นักวิทยาศาสตร์น้อย ป.1 - ป.3', icon: '🔬', image: 'https://placehold.co/600x400/6366f1/ffffff?text=Science' },
    { id: 'soc', title: 'สังคมและความเป็นพลเมือง', desc: 'ครอบครัวของฉัน ป.1 - ป.3', icon: '🌾', image: 'https://placehold.co/600x400/10b981/ffffff?text=Social+Studies' },
    { id: 'eco', title: 'เศรษฐกิจและการเงิน', desc: 'การเรียนรู้เพื่อชีวิต ป.1 - ป.3', icon: '💰', image: 'https://placehold.co/600x400/f59e0b/ffffff?text=Economics' },
    { id: 'hea', title: 'สุขภาพกายและจิต', desc: 'พลศึกษา ป.1 - ป.3', icon: '🩺', image: 'https://placehold.co/600x400/ef4444/ffffff?text=Health' },
    { id: 'art', title: 'ศิลปะและวัฒนธรรมเพื่อสุนทรียภาพ', desc: 'ศิลปะ ป.1 - ป.3', icon: '🎨', image: 'https://placehold.co/600x400/8b5cf6/ffffff?text=Arts' },
    { id: 'eng', title: 'ภาษาอังกฤษ', desc: 'รายวิชาพื้นฐาน 80 ชม.', icon: '🇬🇧', image: 'https://placehold.co/600x400/94a3b8/ffffff?text=English' },
  ];

  return (
    <div className="container" style={{ padding: '3rem 0', animation: 'fadeIn 0.5s ease-out' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>หมวดหมู่วิชา</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.2rem' }}>
        แผนการจัดการเรียนรู้ หลักสูตรนำร่อง พุทธศักราช 2568 (ด้านประยุกต์ใช้ในชีวิตประจำวัน 40 ชม.)
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {subjects.map((subject, index) => (
          <div key={subject.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', animation: `slideUp ${0.3 + index * 0.1}s ease-out` }}>
            <div style={{ height: '200px', backgroundImage: `url(${subject.image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: subject.comingSoon ? 0.7 : 1 }}></div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
              {subject.comingSoon && (
                <span style={{ position: 'absolute', top: '-15px', right: '15px', background: 'var(--text-main)', color: 'var(--bg-color)', padding: '0.2rem 0.8rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
                  เร็วๆ นี้
                </span>
              )}
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{subject.icon}</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: subject.comingSoon ? 'var(--text-muted)' : 'var(--text-main)' }}>{subject.title}</h3>
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
