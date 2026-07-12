import type { Metadata } from 'next'
import { Prompt } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const prompt = Prompt({ subsets: ['thai', 'latin'], weight: ['300', '400', '500', '600', '700'] })

import { getSession } from './actions/auth'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'

export const metadata: Metadata = {
  title: 'G21 คลังสื่องานสอน - แผนการสอนและใบงานสำเร็จรูป',
  description: 'แผนการสอน ใบงาน ข้อสอบ สำเร็จรูป พร้อมใช้ แก้ไขได้ ตรงตามตัวชี้วัด เหมาะสำหรับครูประถม',
  openGraph: {
    title: 'G21 คลังสื่องานสอน - แผนการสอนและใบงานสำเร็จรูป',
    description: 'แผนการสอน ใบงาน ข้อสอบ สำเร็จรูป พร้อมใช้ แก้ไขได้ ตรงตามตัวชี้วัด',
    url: 'https://g21-store.com',
    siteName: 'G21 คลังสื่องานสอน',
    images: [
      {
        url: 'https://placehold.co/1200x630/1A4731/D4AF37?text=G21+Lesson+Plan+Store',
        width: 1200,
        height: 630,
        alt: 'G21 คลังสื่องานสอน',
      },
    ],
    locale: 'th_TH',
    type: 'website',
  },
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
