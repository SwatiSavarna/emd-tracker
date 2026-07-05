import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BG Tracker — Bank Guarantee & EMD Management',
  description: 'Never miss a bank guarantee renewal. Track EMDs, BGs, and bid bonds for Indian construction companies.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
