'use client';

import { useState } from 'react';
import { createProduct, updateProduct, deleteProduct, updateProductLink } from '@/app/actions/admin';

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
  
  // For inline link editing
  const [inlineLinks, setInlineLinks] = useState<Record<string, string>>({});
  const [savingLink, setSavingLink] = useState<string | null>(null);

  const handleSaveLink = async (productId: string) => {
    const newUrl = inlineLinks[productId];
    if (newUrl === undefined) return;
    setSavingLink(productId);
    try {
      const res = await updateProductLink(productId, newUrl) as any;
      if (res && res.error) throw new Error(res.error);
      alert('บันทึกลิงก์สำเร็จ');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'บันทึกลิงก์ไม่สำเร็จ');
    } finally {
      setSavingLink(null);
    }
  };

  const subjectNames: Record<string, string> = {
    'sci': 'วิทยาศาสตร์ สิ่งแวดล้อม และเทคโนโลยี',
    'soc': 'สังคมและความเป็นพลเมือง',
    'eco': 'เศรษฐกิจและการเงิน',
    'hea': 'สุขภาพกายและจิต',
    'art': 'ศิลปะและวัฒนธรรมเพื่อสุนทรีภาพ',
    'eng': 'ภาษาอังกฤษ',
    'math': 'คณิตศาสตร์',
    'thai': 'ภาษาไทย',
    'hist': 'ประวัติศาสตร์'
  };

  const packageTypes = [
    { id: 'single-normal', title: 'แผนการสอน 40 ชั่วโมง + ใบงานพร้อมเฉลย', defaultPrice: 150 },
    { id: 'single-worksheet', title: 'ใบงาน PNG ไม่ติดลายน้ำ', defaultPrice: 79 },
    { id: 'single-exam', title: 'ข้อสอบพร้อมเฉลย', defaultPrice: 59 },
    { id: 'single-onepage', title: 'แผนหน้าเดียว', defaultPrice: 89 },
    { id: 'single-post', title: 'บันทึกหลังสอน (120 แบบ)', defaultPrice: 99 },
    { id: 'combo-full', title: 'คอมโบเซ็ต (รวมทุกอย่าง)', defaultPrice: 399 },
    { id: 'custom', title: 'อื่นๆ (พิมพ์รหัสและชื่อเอง)', defaultPrice: 0 }
  ];

  const [selectedPkgType, setSelectedPkgType] = useState('single-normal');

  const updateAutoFields = (cat: string, grd: string, pkgId: string) => {
    if (pkgId === 'custom') return;
    const pkg = packageTypes.find(p => p.id === pkgId);
    if (!pkg) return;
    setFormData(prev => ({
      ...prev,
      category: cat,
      grade: grd,
      id: `${cat}-${grd}-${pkgId}`,
      title: pkg.title,
      price: pkg.defaultPrice
    }));
  };

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
    setSelectedPkgType('single-normal');
    setFormData({ 
      id: 'sci-P1-single-normal', 
      title: 'แผนการสอน 40 ชั่วโมง + ใบงานพร้อมเฉลย', 
      description: '', 
      price: 150, 
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
        const result = await updateProduct(formData.id, payload) as any;
        if (result && result.error) {
          throw new Error(result.error);
        }
        alert('อัปเดตสินค้าสำเร็จ');
      } else {
        const result = await createProduct(payload) as any;
        if (result && result.error) {
          throw new Error(result.error);
        }
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
          
          {isNew && (
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', border: '1px solid var(--primary)', marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>รูปแบบแพ็กเกจมาตรฐาน (ประหยัดเวลาพิมพ์)</label>
              <select 
                value={selectedPkgType} 
                onChange={e => {
                  const pkgId = e.target.value;
                  setSelectedPkgType(pkgId);
                  if (pkgId !== 'custom') {
                    updateAutoFields(formData.category, formData.grade, pkgId);
                  } else {
                    setFormData(prev => ({...prev, id: '', title: ''}));
                  }
                }}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.5)', color: 'white' }}
              >
                {packageTypes.map(p => (
                  <option key={p.id} value={p.id} style={{ color: 'black' }}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>หมวดหมู่วิชา (Category)</label>
              <select 
                value={formData.category} 
                onChange={e => {
                  const newCat = e.target.value;
                  if (isNew && selectedPkgType !== 'custom') {
                    updateAutoFields(newCat, formData.grade, selectedPkgType);
                  } else {
                    setFormData({...formData, category: newCat});
                  }
                }}
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
                onChange={e => {
                  const newGrd = e.target.value;
                  if (isNew && selectedPkgType !== 'custom') {
                    updateAutoFields(formData.category, newGrd, selectedPkgType);
                  } else {
                    setFormData({...formData, grade: newGrd});
                  }
                }}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>รหัสสินค้า (ID) *</label>
              <input 
                type="text" 
                required 
                disabled={!isNew || (isNew && selectedPkgType !== 'custom')}
                value={formData.id} 
                onChange={e => setFormData({...formData, id: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white', opacity: (!isNew || selectedPkgType !== 'custom') ? 0.7 : 1 }}
                placeholder="เช่น sci-P1-combo-full"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>ชื่อสินค้า (Title) *</label>
              <input 
                type="text" 
                required 
                disabled={isNew && selectedPkgType !== 'custom'}
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'white', opacity: (isNew && selectedPkgType !== 'custom') ? 0.7 : 1 }}
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

  // Group by category for admin display
  const categoryMap: Record<string, typeof products> = {
    'soc': [],
    'math': [],
    'sci': [],
    'thai': [],
    'hist': [],
    'hea': [],
    'eco': [],
    'art': [],
    'eng': [],
  };

  const uncategorized: typeof products = [];

  const normalizeCat = (cat: string) => {
    if (!cat) return '';
    if (cat === 'วิทยาศาสตร์') return 'sci';
    if (cat === 'สังคมศึกษา' || cat === 'สังคม' || cat === 'สังคมและความเป็นพลเมือง') return 'soc';
    if (cat === 'เศรษฐศาสตร์' || cat === 'เศรษฐกิจและการเงิน') return 'eco';
    if (cat === 'สุขศึกษา' || cat === 'สุขภาพกายและจิต') return 'hea';
    if (cat === 'ศิลปะ' || cat === 'ศิลปะและวัฒนธรรมเพื่อสุนทรีภาพ') return 'art';
    if (cat === 'ภาษาอังกฤษ') return 'eng';
    if (cat === 'คณิตศาสตร์') return 'math';
    if (cat === 'ภาษาไทย') return 'thai';
    if (cat === 'ประวัติศาสตร์') return 'hist';
    return cat;
  };

  products.forEach(p => {
    const cat = normalizeCat(p.category);
    if (categoryMap[cat]) {
      categoryMap[cat].push(p);
    } else {
      uncategorized.push(p);
    }
  });

  const sortItems = (items: any[]) => {
    return [...items].sort((a, b) => {
      const gradeOrder: Record<string, number> = { 'P1': 1, 'P2': 2, 'P3': 3, 'P4': 4, 'P5': 5, 'P6': 6 };
      const gradeA = gradeOrder[a.grade] || 99;
      const gradeB = gradeOrder[b.grade] || 99;
      if (gradeA !== gradeB) return gradeA - gradeB;
      return (a.title || '').localeCompare(b.title || '', 'th');
    });
  };

  const renderProductCard = (product: any, catName: string) => {
    const gradeStr = product.grade.replace('P', 'ป.');
    const currentLinkValue = inlineLinks[product.id] !== undefined ? inlineLinks[product.id] : (product.downloadUrl || '');
    
    return (
      <div key={product.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', opacity: product.isActive ? 1 : 0.5 }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
            {!product.isActive && <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>ปิด</span>}
            วิชา{catName} {gradeStr}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>แพ็กเกจ: {product.title}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>รหัส: {product.id} | ราคา: ฿{product.price} | รูปภาพ: {product.images?.length || 0} รูป</div>
          
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              type="url"
              placeholder="วางลิงก์ Google Drive / OneDrive ที่นี่"
              value={currentLinkValue}
              onChange={(e) => setInlineLinks({ ...inlineLinks, [product.id]: e.target.value })}
              style={{ flex: 1, minWidth: '250px', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.875rem' }}
            />
            <button 
              className="btn btn-primary"
              onClick={() => handleSaveLink(product.id)}
              disabled={savingLink === product.id || (inlineLinks[product.id] === undefined && !product.downloadUrl)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: savingLink === product.id ? 0.7 : 1 }}
            >
              {savingLink === product.id ? 'กำลังบันทึก...' : '💾 บันทึกลิงก์'}
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}>
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
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>จัดการสินค้าทั้งหมด ({products.length} รายการ)</h2>
        <button className="btn btn-primary" onClick={handleCreateNew}>+ เพิ่มสินค้าใหม่</button>
      </div>
      
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>ยังไม่มีสินค้าในระบบ</div>
      ) : (
        <div>
          {Object.entries(categoryMap).map(([cat, items]) => {
            if (items.length === 0) return null;
            const catName = subjectNames[cat] || cat;
            const sortedItems = sortItems(items);
            return (
              <div key={cat} style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  วิชา{catName} ({items.length} รายการ)
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {sortedItems.map(product => renderProductCard(product, catName))}
                </div>
              </div>
            );
          })}
          
          {uncategorized.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                วิชาอื่นๆ ({uncategorized.length} รายการ)
              </h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {sortItems(uncategorized).map(product => renderProductCard(product, subjectNames[product.category] || product.category))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
