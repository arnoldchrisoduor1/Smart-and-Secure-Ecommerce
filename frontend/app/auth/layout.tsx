import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BeanCart - Your Premium Shopping Destination',
  description: 'Discover amazing products with fast, secure, and transparent shopping experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {/* If you want navbar on all pages including register */}
        {/* <Navbar /> */}
        
        <main className="flex- m-20">
          {children}
        </main>
        
        {/* If you want footer on all pages including register */}
        {/* <Footer /> */}
      </body>
    </html>
  )
}