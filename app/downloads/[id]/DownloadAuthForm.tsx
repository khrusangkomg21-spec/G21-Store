'use client';

import { useState } from 'react';

export default function DownloadAuthForm({ requiredEmail, items }: { requiredEmail: string, items: any[] }) {
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === requiredEmail.toLowerCase()) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('อีเมลไม่ถูกต้อง กรุณาระบุอีเมลที่ใช้สั่งซื้อ');
    }
  };

  if (isAuthenticated) {
    return (
      <div className="mt-8 space-y-4 text-left">
        <h2 className="text-xl font-semibold mb-4 text-[#FACC15]">ไฟล์สื่อการสอน</h2>
        {items.map(item => (
          <div key={item.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700">
            <div>
              <h3 className="font-semibold text-white">{item.product.title}</h3>
              <p className="text-sm text-gray-400">{item.product.description}</p>
            </div>
            {item.product.downloadUrl ? (
              <a 
                href={item.product.downloadUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#FACC15] text-black font-semibold rounded-lg hover:bg-[#F59E0B] transition-colors"
              >
                ดาวน์โหลด
              </a>
            ) : (
              <span className="text-gray-500 italic">รออัปเดตลิงก์</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-center">กรุณายืนยันตัวตน</h2>
      <p className="text-sm text-gray-400 mb-4 text-center">
        เพื่อความปลอดภัย กรุณากรอกอีเมลที่คุณใช้ตอนสั่งซื้อ เพื่อเข้าถึงไฟล์ดาวน์โหลด
      </p>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">อีเมลที่ใช้สั่งซื้อ</label>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-[#FACC15] text-white"
          placeholder="example@email.com"
          required
        />
      </div>

      <button type="submit" className="w-full btn btn-primary py-2 rounded-lg font-semibold">
        ยืนยันเพื่อดาวน์โหลด
      </button>
    </form>
  );
}
