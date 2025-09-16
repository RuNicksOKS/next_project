import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Instagram',
  description: 'Instagram 로그인 페이지',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-black text-white font-sans" suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
