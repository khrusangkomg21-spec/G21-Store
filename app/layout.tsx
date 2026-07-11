import type { Metadata } from 'next'
import { Prompt } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const prompt = Prompt({ subsets: ['thai', 'latin'], weight: ['300', '400', '500', '600', '700'] })

import { getSession } from './actions/auth'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'

export const metadata: Metadata = {
  title: 'G21 คลังสื่องานสอน | รองรับหลักสูตรใหม่ 2568',
  description: 'สื่อการสอนพร้อมใช้ ครบ 5 วิชา แผนการสอน ใบงาน ข้อสอบ แผนหน้าเดียว บันทึกหลังสอน',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession();

  return (
    <html lang="th">
      <body className={prompt.className}>
        <CartProvider>
          <Navbar session={session} />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <footer style={{ borderTop: '1px solid var(--border-color)', padding: '2rem 0', marginTop: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="container">
              <p>&copy; 2026 G21 คลังสื่องานสอน หลักสูตรใหม่ 2568. All rights reserved.</p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  )
}
