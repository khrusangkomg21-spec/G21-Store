import Link from 'next/link';

export default function Success() {
  return (
    <div className="container" style={{ padding: '4rem 0', animation: 'slideUp 0.5s ease-out', textAlign: 'center', maxWidth: '800px' }}>
      <div style={{ fontSize: '5rem', color: '#10b981', marginBottom: '1rem' }}>✓</div>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>ชำระเงินสำเร็จ!</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '3rem' }}>
        ขอบคุณสำหรับการสั่งซื้อแผนการสอน ระบบได้ส่งใบเสร็จรับเงินและลิงก์สำรองไปยังอีเมลของคุณแล้ว
      </p>

      <div className="glass-card" style={{ padding: '2rem', textAlign: 'left', marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          รายการไฟล์ที่คุณสามารถดาวน์โหลดได้ทันที
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* File 1 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-color)', borderRadius: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>📄</div>
              <div>
                <p style={{ fontWeight: 600 }}>วิทยาศาสตร์ สิ่งแวดล้อม และเทคโนโลยี (SCI) - ป.1</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>เซ็ตแผนปกติพร้อมใบงาน + แผนหน้าเดียว + หลังสอน.zip (45 MB)</p>
              </div>
            </div>
            <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>ดาวน์โหลด</button>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem', textAlign: 'left', marginBottom: '3rem', border: '2px solid var(--primary)', background: 'radial-gradient(circle at center, #0a291c, var(--bg-color))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💎</span> สิทธิ์เข้ากลุ่ม VIP MEMBERSHIP [ป.1-3]
            </h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>กรุณากดปุ่มด้านล่างเพื่อขอเข้ากลุ่ม Facebook VIP</p>
          </div>
          <a href="#" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
            เข้าร่วมกลุ่ม Facebook
          </a>
        </div>
        <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#ef4444' }}>⚠️ ขั้นตอนการอนุมัติเข้ากลุ่ม:</p>
          <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>กดปุ่ม <b>เข้าร่วมกลุ่ม Facebook</b> ด้านบน</li>
            <li>ตอบคำถามก่อนเข้ากลุ่มโดยระบุหมายเลขคำสั่งซื้อของคุณ คือ <b style={{ color: 'var(--text-main)' }}>#ORD-99842</b></li>
            <li>รอแอดมินตรวจสอบข้อมูลการชำระเงินและกดอนุมัติภายใน 24 ชั่วโมง</li>
          </ol>
        </div>
      </div>

      <Link href="/store" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
        กลับไปหน้าเลือกร้านค้า
      </Link>
    </div>
  );
}
