'use client';

import { useState } from 'react';
import { createProduct, updateProduct, deleteProduct } from '@/app/actions/admin';

export default function ProductsTab({ products, fetchData }: { products: any[], fetchData: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState({ 
    id: '', 
    title: '', 
    description: '', 
    price: 0, 
    category: 'sci', 
    grade: 'P1', 
    downloadUrl: '', 
    images: '', 
    isActive: true 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (prod: any) => {
    setFormData({
      ...prod,
      images: prod.images ? prod.images.join('\n') : '',
      description: prod.description || '',
      downloadUrl: prod.downloadUrl || ''
    });
    setIsNew(false);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setFormData({ 
      id: '', 
      title: '', 
      description: '', 
      price: 0, 
      category: 'sci', 
      grade: 'P1', 
      downloadUrl: '', 
      images: '', 
      isActive: true 
    });
    setIsNew(true);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if(confirm('ต้องการลบสินค้านี้ใช่หรือไม่? (หากลบแล้วจะกู้คืนไม่ได้ แนะนำให้ปิดการขายแทน)')) {
      try {
        await deleteProduct(id);
        fetchData();
      } catch (err: any) {
        alert(err.message || 'ลบไม่สำเร็จ');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        images: formData.images.split('\n').map(s => s.trim()).filter(Boolean)
      };

      if (!isNew) {
        await updateProduct(formData.id, payload);
        alert('อัปเดตสินค้าสำเร็จ');
      } else {
        await createProduct(payload);
        alert('เพิ่มสินค้าสำเร็จ');
      }
      setIsEditing(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>{isNew ? 'เพิ่มสินค้าใหม่' : 'แก้ไขสินค้า'}</h2>
          <button className="btn" onClick={() => setIsEditing(false)}>ย้อนกลับ</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>รหัสสินค้า (ID) *</label>
              <input 
                type="text" 
                required 
                disabled={!isNew}
                value={formData.id} 
                onChange={e => setFormData({...formData, id: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                placeholder="เช่น sci-P1-combo-full"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>ชื่อสินค้า (Title) *</label>
              <input 
                type="text" 
                required 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>ราคา (Price) *</label>
              <input 
                type="number" 
                required 
                min="0"
                value={formData.price} 
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>หมวดหมู่วิชา (Category)</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
              >
                <option value="sci" style={{ color: 'black' }}>วิทยาศาสตร์</option>
                <option value="soc" style={{ color: 'black' }}>สังคม</option>
                <option value="eco" style={{ color: 'black' }}>เศรษฐศาสตร์</option>
                <option value="hea" style={{ color: 'black' }}>สุขศึกษา</option>
                <option value="art" style={{ color: 'black' }}>ศิลปะ</option>
                <option value="eng" style={{ color: 'black' }}>ภาษาอังกฤษ</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>ระดับชั้น (Grade)</label>
              <select 
                value={formData.grade} 
                onChange={e => setFormData({...formData, grade: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
              >
                <option value="P1" style={{ color: 'black' }}>ป.1</option>
                <option value="P2" style={{ color: 'black' }}>ป.2</option>
                <option value="P3" style={{ color: 'black' }}>ป.3</option>
                <option value="P4" style={{ color: 'black' }}>ป.4</option>
                <option value="P5" style={{ color: 'black' }}>ป.5</option>
                <option value="P6" style={{ color: 'black' }}>ป.6</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'white' }}>
                <input 
                  type="checkbox" 
                  checked={formData.isActive} 
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  style={{ width: '1.2rem', height: '1.2rem' }}
                />
                เปิดการขาย (Active)
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>คำอธิบายเพิ่มเติม (Description)</label>
            <input 
              type="text" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              รูปภาพตัวอย่าง (ใส่ URL ของรูป บรรทัดละ 1 รูปภาพ สูงสุด 10 รูป)
            </label>
            <textarea 
              rows={4}
              value={formData.images}
              onChange={e => setFormData({...formData, images: e.target.value})}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>ลิงก์ดาวน์โหลดไฟล์ Google Drive / OneDrive (เมื่ออนุมัติ)</label>
            <input 
              type="url" 
              value={formData.downloadUrl} 
              onChange={e => setFormData({...formData, downloadUrl: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem' }}>
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>จัดการสินค้าทั้งหมด ({products.length} รายการ)</h2>
        <button className="btn btn-primary" onClick={handleCreateNew}>+ เพิ่มสินค้าใหม่</button>
      </div>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        {products.map(product => (
          <div key={product.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', opacity: product.isActive ? 1 : 0.5 }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <div style={{ fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {!product.isActive && <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>ปิด</span>}
                {product.title}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>รหัส: {product.id} | วิชา: {product.category} | ชั้น: {product.grade} | ราคา: ฿{product.price}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>รูปภาพ: {product.images?.length || 0} รูป</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-outline"
                onClick={() => handleEdit(product)}
                style={{ padding: '0.5rem 1rem' }}
              >
                ✏️ แก้ไข
              </button>
              <button 
                className="btn"
                onClick={() => handleDelete(product.id)}
                style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
              >
                ลบ
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>ยังไม่มีสินค้าในระบบ</div>
        )}
      </div>
    </div>
  );
}
