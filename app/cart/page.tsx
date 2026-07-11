import Link from 'next/link';

export default function Cart() {
  const mockCartItems = [
    { id: 1, subject: 'วิทยาศาสตร์ สิ่งแวดล้อม และเทคโนโลยี', grade: 'ป.1', package: 'เซ็ตแผนปกติพร้อมใบงาน + แผนหน้าเดียว + หลังสอน', price: 239, icon: '🔬' },
    { id: 2, subject: 'สังคมและความเป็นพลเมือง', grade: 'ป.2', package: 'เซ็ตแผนปกติพร้อมใบงาน + แผนหน้าเดียว + หลังสอน', price: 239, icon: '🌾' },
    { id: 3, subject: 'ศิลปะและวัฒนธรรมเพื่อสุนทรียภาพ', grade: 'ป.3', package: 'แผนหน้าเดียว', price: 89, icon: '🎨' },
  ];

  const subtotal = mockCartItems.reduce((sum, item) => sum + item.price, 0);
  const discount = subtotal >= 500 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  return (
    <div className="container" style={{ padding: '3rem 0', animation: 'fadeIn 0.5s ease-out' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>ตะกร้าสินค้า</h1>
      
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Cart Items List */}
        <div style={{ flex: '1.5', minWidth: '300px' }}>
          {mockCartItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mockCartItems.map(item => (
                <div key={item.id} className="glass-card" style={{ display: 'flex', padding: '1.5rem', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '3rem', background: 'rgba(212, 175, 55, 0.1)', padding: '1rem', borderRadius: '1rem' }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>{item.subject} (ชั้น {item.grade})</div>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{item.package}</h3>
                    <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>&times;</span> ลบออก
                    </button>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    ฿{item.price}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '1rem' }}>ไม่มีสินค้าในตะกร้า</p>
              <Link href="/store" className="btn btn-primary">ไปเลือกซื้อแผนการสอน</Link>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="glass-card" style={{ flex: '1', minWidth: '300px', padding: '2rem', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>สรุปคำสั่งซื้อ</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>ยอดรวม ({mockCartItems.length} รายการ)</span>
            <span>฿{subtotal}</span>
          </div>

          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
              <span style={{ color: '#10b981', fontWeight: 600 }}>ส่วนลด 10% (ซื้อครบ 500.-)</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>- ฿{Math.floor(discount)}</span>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>ยอดสุทธิ</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>฿{Math.floor(total)}</span>
          </div>

          <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}>
            ดำเนินการชำระเงิน
          </Link>
          
          {subtotal < 500 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
              ซื้อเพิ่มอีก ฿{500 - subtotal} เพื่อรับส่วนลด 10%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
