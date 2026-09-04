import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'مولّد الفواتير العربي',
  description: 'إنشاء فواتير احترافية بالعربية ل┫ أعمالك',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
