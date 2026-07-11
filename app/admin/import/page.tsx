'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setResult('กำลังอ่านไฟล์ Excel...');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
      
      let startIndex = workbook.SheetNames.findIndex(name => name.includes('กรกฎา 2568') || name.includes('รายได้กรกฎา'));
      if (startIndex === -1) startIndex = 0; 
      
      const parsedUsers: any[] = [];
      
      for (let i = startIndex; i < workbook.SheetNames.length; i++) {
        const sheetName = workbook.SheetNames[i];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet) as any[];
        
        for (const row of data) {
          let facebook = '';
          let name = '';
          let isVip = false;
          
          for (const key of Object.keys(row)) {
            const lowerKey = key.toLowerCase();
            const val = String(row[key]);
            
            if (lowerKey.includes('เฟส') || lowerKey.includes('facebook')) facebook = val;
            else if (lowerKey.includes('ชื่อ') && !lowerKey.includes('เฟส')) name = val;
            
            if (val.toLowerCase().includes('vip')) isVip = true;
          }
          
          if (facebook || name) {
            parsedUsers.push({ facebookName: facebook, name, isVip });
          }
        }
      }
      
      setResult(`อ่านไฟล์สำเร็จ พบข้อมูลลูกค้า ${parsedUsers.length} รายการ กำลังบันทึกลงฐานข้อมูล...`);
      
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: parsedUsers })
      });
      
      const json = await res.json();
      if (json.success) {
        setResult(json.message);
      } else {
        setResult('เกิดข้อผิดพลาด: ' + json.error);
      }
      
    } catch (error: any) {
      setResult('เกิดข้อผิดพลาด: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1>นำเข้าข้อมูลลูกค้า (Excel)</h1>
      <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem' }}>
        <p>อัปโหลดไฟล์ <strong>รายได้-ข้อมูลลูกค้า-web.xlsx</strong> ระบบจะทำการ:</p>
        <ul style={{ paddingLeft: '1.5rem', margin: '1rem 0', color: 'var(--text-muted)' }}>
          <li>เริ่มอ่านตั้งแต่ชีตที่ชื่อว่า <code>รายได้กรกฎา 2568</code></li>
          <li>ดึงข้อมูล ชื่อ, นามสกุล, เฟสบุ๊ค และสถานะ VIP ให้อัตโนมัติ</li>
        </ul>
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ display: 'block', margin: '2rem 0' }}
        />
        <button 
          onClick={handleImport}
          disabled={!file || loading}
          className="btn"
        >
          {loading ? 'กำลังประมวลผล...' : 'เริ่มนำเข้าข้อมูล'}
        </button>
        {result && <p style={{ marginTop: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{result}</p>}
      </div>
    </div>
  );
}
