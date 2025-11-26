import '../index.css'
import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'

const dm = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Um, Actually?',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={dm.className}>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>

  )
}