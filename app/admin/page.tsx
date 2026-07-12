'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { 
  getPendingOrders, 
  getCompletedOrders,
  approveOrder, 
  rejectOrder, 
  getAllProducts, 
  updateProductLink,
  getDashboardStats,
  getAllCustomers,
  importLegacyCustomers
} from '@/app/actions/admin';
import ProductsTab from './ProductsTab';
import AnalyticsChart from '@/components/admin/AnalyticsChart';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'customers'>('orders');
  const [stats, setStats] = useState({ pendingCount: 0, approvedToday: 0, salesToday: 0, salesMonth: 0 });
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('all'); 
  
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const dbStats = await getDashboardStats();
      setStats(dbStats);

      if (activeTab === 'orders') {
        const pending = await getPendingOrders();
        const completed = await getCompletedOrders();
        setPendingOrders(pending);
        setCompletedOrders(completed);
      } else if (activeTab === 'products') {
        const prods = await getAllProducts();
        setProducts(prods);
      } else if (activeTab === 'customers') {
        const custs = await getAllCustomers();
        setCustomers(custs);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const parsed = data.map((row: any) => ({
          facebookName: row['Facebook'] || row['ชื่อเฟส'] || row['ชื่อเฟสบุ๊ค'] || row['facebookName'],
          name: row['Name'] || row['ชื่อ-สกุลจริง'] || row['ชื่อ-สกุล'],
          isVip: !!(row['VIP'] || row['isVip'] || row['vip']),
          legacyPackages: row['สินค้าที่เคยซื้อ'] || row['แพ็กเกจ'] || row['Packages'] || row['packages'] || null
        }));
        
        const res = await importLegacyCustomers(parsed);
        if(res.success) {
          alert(`นำเข้าข้อมูลสำเร็จ ${res.count} รายการ`);
          fetchData();
        }
      } catch (err) {
        alert('รูปแบบไฟล์ไม่ถูกต้อง หรือเกิดข้อผิดพลาด');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(customers.map(c => ({
      'ชื่อเฟสบุ๊ค': c.facebookName || '',
      'ชื่อ-สกุลจริง': c.name || '',
      'อีเมลในระบบ': c.email,
      'VIP': c.isVip ? 'ใช่' : '-',
      'วันที่สมัคร': new Date(c.createdAt).toLocaleDateString('th-TH')
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "G21_Customers.xlsx");
  };

  const filteredCompletedOrders = filterMonth === 'all' 
    ? completedOrders 
    : completedOrders.filter(order => {
        const date = new Date(order.updatedAt);
        const yyyymm = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return yyyymm === filterMonth;
      });

  if (isLoading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>กำลังโหลดข้อมูล...</div>;
  }

  // Prepare chart data based on last 7 days of orders
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  });

  const chartData = last7Days.map(dateLabel => {
    const dailyOrders = completedOrders.filter(o => 
      new Date(o.updatedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) === dateLabel
    );
    const dailyTotal = dailyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { name: dateLabel, ยอดขาย: dailyTotal };
  });

  return (
    <div className="container" style={{ padding: '2rem 0', animation: 'fadeIn 0.5s ease-out' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--primary)' }}>Admin Dashboard</h1>
      
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--primary)' }}>📊</span> ยอดขาย 7 วันล่าสุด
        </h2>
        <AnalyticsChart data={chartData} />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid #fbbf24' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>รอตรวจสอบ</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{stats.pendingCount}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid #10b981' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>อนุมัติวันนี้</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{stats.approvedToday}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ยอดขายวันนี้</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>฿{stats.salesToday.toLocaleString()}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ยอดขายเดือนนี้</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>฿{stats.salesMonth.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
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
        <button 
          className={`btn ${activeTab === 'customers' ? 'btn-primary' : ''}`}
          style={{ background: activeTab !== 'customers' ? 'rgba(255,255,255,0.1)' : undefined }}
          onClick={() => setActiveTab('customers')}
        >
          จัดการฐานข้อมูลลูกค้า (Excel)
        </button>
      </div>

      {/* Content */}
      <div className="glass-card" style={{ padding: '2rem', overflowX: 'auto' }}>
        
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fbbf24' }}>รอตรวจสอบ ({pendingOrders.length})</h2>
            <div style={{ overflowX: 'auto', marginBottom: '3rem' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem' }}>วัน/เวลาสั่งซื้อ</th>
                    <th style={{ padding: '1rem' }}>เลขที่คำสั่งซื้อ</th>
                    <th style={{ padding: '1rem' }}>ผู้ใช้ / อีเมล</th>
                    <th style={{ padding: '1rem' }}>ยอดโอน</th>
                    <th style={{ padding: '1rem' }}>สลิป</th>
                    <th style={{ padding: '1rem' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>{new Date(order.createdAt).toLocaleString('th-TH')}</td>
                      <td style={{ padding: '1rem' }}>{order.orderNumber}</td>
                      <td style={{ padding: '1rem' }}>{order.guestEmail || order.user?.facebookName || order.user?.email}</td>
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
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
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
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>ไม่มีคำสั่งซื้อที่รอตรวจสอบ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#10b981' }}>อนุมัติแล้ว (ประวัติย้อนหลัง)</h2>
              <select 
                className="btn"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-color)', padding: '0.5rem 1rem' }}
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="all">ทั้งหมด (รายการล่าสุด)</option>
                {Array.from({length: 12}).map((_, i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - i);
                  const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  const label = d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
                  return <option key={val} value={val} style={{ color: 'black' }}>{label}</option>
                })}
              </select>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem' }}>วัน/เวลาที่อนุมัติ</th>
                    <th style={{ padding: '1rem' }}>เลขที่คำสั่งซื้อ</th>
                    <th style={{ padding: '1rem' }}>ผู้ใช้ / อีเมล</th>
                    <th style={{ padding: '1rem' }}>ยอดโอน</th>
                    <th style={{ padding: '1rem' }}>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompletedOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>{new Date(order.updatedAt).toLocaleString('th-TH')}</td>
                      <td style={{ padding: '1rem' }}>{order.orderNumber}</td>
                      <td style={{ padding: '1rem' }}>{order.guestEmail || order.user?.facebookName || order.user?.email}</td>
                      <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 600 }}>฿{order.totalAmount}</td>
                      <td style={{ padding: '1rem', color: '#10b981' }}>อนุมัติแล้ว</td>
                    </tr>
                  ))}
                  {filteredCompletedOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>ไม่มีข้อมูลในเดือนที่เลือก</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <ProductsTab products={products} fetchData={fetchData} />
        )}

        {activeTab === 'customers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem' }}>ฐานข้อมูลลูกค้าเก่า/ใหม่ ({customers.length} รายการ)</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  การนำเข้าไฟล์ Excel ตั้งชื่อหัวคอลัมน์ว่า: "ชื่อเฟส", "ชื่อ-สกุลจริง", และ "VIP" (ใส่ช่องนั้นว่า TRUE ถ้าเป็น VIP)
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label className="btn btn-outline" style={{ cursor: 'pointer', borderColor: '#10b981', color: '#10b981', padding: '0.5rem 1rem' }}>
                  📥 นำเข้า Excel
                  <input type="file" accept=".xlsx, .xls" hidden onChange={handleFileUpload} />
                </label>
                <button className="btn btn-primary" onClick={handleExport} style={{ padding: '0.5rem 1rem' }}>
                  📤 ส่งออก Excel
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem' }}>วันที่เพิ่มเข้าสู่ระบบ</th>
                    <th style={{ padding: '1rem' }}>ชื่อเฟสบุ๊ค</th>
                    <th style={{ padding: '1rem' }}>ชื่อ-สกุลจริง</th>
                    <th style={{ padding: '1rem' }}>สถานะ VIP</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>{new Date(c.createdAt).toLocaleDateString('th-TH')}</td>
                      <td style={{ padding: '1rem' }}>{c.facebookName || '-'}</td>
                      <td style={{ padding: '1rem' }}>{c.name || '-'}</td>
                      <td style={{ padding: '1rem' }}>
                        {c.isVip ? (
                          <span style={{ background: 'linear-gradient(90deg, #4f46e5, #312e81)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem' }}>VIP</span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>ยังไม่มีข้อมูลลูกค้า</td>
                    </tr>
                  )}
                </tbody>
              </table>
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
