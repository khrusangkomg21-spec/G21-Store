'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getPendingOrders, 
  getCompletedOrders,
  approveOrder, 
  rejectOrder, 
  getAllProducts, 
  updateProductLink 
} from '@/app/actions/admin';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'orders') {
        const pending = await getPendingOrders();
        const completed = await getCompletedOrders();
        setPendingOrders(pending);
        setCompletedOrders(completed);
      } else {
        const prods = await getAllProducts();
        setProducts(prods);
      }
    } catch (error) {
      console.error(error);
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ หรือกรุณาล็อกอินด้วยบัญชีแอดมิน');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (orderId: string) => {
    if (confirm('ยืนยันการอนุมัติคำสั่งซื้อนี้?')) {
      await approveOrder(orderId);
      fetchData();
    }
  };

  const handleReject = async (orderId: string) => {
    if (confirm('ยืนยันการปฏิเสธคำสั่งซื้อนี้ (ยกเลิก)?')) {
      await rejectOrder(orderId);
      fetchData();
    }
  };

  const handleUpdateLink = async (productId: string, link: string) => {
    await updateProductLink(productId, link);
    alert('บันทึกลิงก์สำเร็จ!');
  };

  if (isLoading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem 0', animation: 'fadeIn 0.5s ease-out' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--primary)' }}>Admin Dashboard</h1>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : ''}`}
          style={{ background: activeTab !== 'orders' ? 'rgba(255,255,255,0.1)' : undefined }}
          onClick={() => setActiveTab('orders')}
        >
          จัดการคำสั่งซื้อ (สลิป)
        </button>
        <button 
          className={`btn ${activeTab === 'products' ? 'btn-primary' : ''}`}
          style={{ background: activeTab !== 'products' ? 'rgba(255,255,255,0.1)' : undefined }}
          onClick={() => setActiveTab('products')}
        >
          จัดการลิงก์ไฟล์งานสอน
        </button>
      </div>

      {/* Content */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fbbf24' }}>รอตรวจสอบ ({pendingOrders.length})</h2>
            
            <div style={{ overflowX: 'auto', marginBottom: '3rem' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem' }}>เลขที่คำสั่งซื้อ</th>
                    <th style={{ padding: '1rem' }}>อีเมล / ผู้ใช้</th>
                    <th style={{ padding: '1rem' }}>ยอดโอน</th>
                    <th style={{ padding: '1rem' }}>สลิป</th>
                    <th style={{ padding: '1rem' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>{order.orderNumber}</td>
                      <td style={{ padding: '1rem' }}>{order.guestEmail || order.user?.email}</td>
                      <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 600 }}>฿{order.totalAmount}</td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          className="btn" 
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                          onClick={() => setSelectedSlip(order.slipImageUrl)}
                        >
                          ดูสลิป
                        </button>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', marginRight: '0.5rem' }}
                          onClick={() => handleApprove(order.id)}
                        >
                          อนุมัติ
                        </button>
                        <button 
                          className="btn" 
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                          onClick={() => handleReject(order.id)}
                        >
                          ปฏิเสธ
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pendingOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>ไม่มีคำสั่งซื้อที่รอตรวจสอบ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#10b981' }}>อนุมัติแล้ว ({completedOrders.length})</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem' }}>เลขที่คำสั่งซื้อ</th>
                    <th style={{ padding: '1rem' }}>อีเมล / ผู้ใช้</th>
                    <th style={{ padding: '1rem' }}>ยอดโอน</th>
                    <th style={{ padding: '1rem' }}>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {completedOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>{order.orderNumber}</td>
                      <td style={{ padding: '1rem' }}>{order.guestEmail || order.user?.email}</td>
                      <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 600 }}>฿{order.totalAmount}</td>
                      <td style={{ padding: '1rem', color: '#10b981' }}>อนุมัติแล้ว</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>กำหนดลิงก์ดาวน์โหลด (OneDrive/Google Drive)</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>นำลิงก์แชร์ไฟล์งานมาวางให้ตรงกับแพ็กเกจ เพื่อให้ลูกค้าดาวน์โหลดอัตโนมัติเมื่ออนุมัติสลิป</p>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {products.map(product => (
                <div key={product.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <div style={{ fontWeight: 600, color: 'white' }}>{product.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{product.subject} {product.grade} (รหัส: {product.key})</div>
                  </div>
                  <input 
                    type="url" 
                    defaultValue={product.downloadUrl || ''}
                    placeholder="วางลิงก์ที่นี่ (เช่น https://1drv.ms/f/s!...)"
                    style={{ flex: '2', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                    onBlur={(e) => {
                      if(e.target.value !== product.downloadUrl) {
                        handleUpdateLink(product.id, e.target.value);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Slip Modal */}
      {selectedSlip && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, padding: '2rem' }}>
          <div style={{ position: 'relative', background: '#1e293b', padding: '1rem', borderRadius: '1rem', maxWidth: '500px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => setSelectedSlip(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>หลักฐานการโอนเงิน</h3>
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
              <img src={selectedSlip} alt="Slip" style={{ maxWidth: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
