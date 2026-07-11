'use client';

import { useState, useEffect } from 'react';

export default function VipDashboard() {
  const [vipData, setVipData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/vip/price')
      .then(res => res.json())
      .then(data => {
        if (data.success) setVipData(data);
      });
  }, []);

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1>ระบบจัดการสมาชิก VIP</h1>
      
      {vipData ? (
        <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text-muted)' }}>จำนวนสมาชิก VIP ปัจจุบัน</h2>
          <div style={{ fontSize: '5rem', fontWeight: 700, color: 'var(--primary)', margin: '1rem 0' }}>
            {vipData.count} <span style={{ fontSize: '2rem' }}>คน</span>
          </div>
          
          <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '1.5rem', borderRadius: '1rem', marginTop: '2rem' }}>
            <h3>ราคาโปรโมชันปัจจุบัน: <span style={{ color: '#10b981', fontSize: '2rem' }}>฿{vipData.price}</span></h3>
            {vipData.nextTier && (
              <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                (ราคาจะปรับขึ้นเมื่อสมาชิกครบ {vipData.nextTier} คน)
              </p>
            )}
          </div>
        </div>
      ) : (
        <p style={{ marginTop: '2rem' }}>กำลังโหลดข้อมูล...</p>
      )}
    </div>
  );
}
