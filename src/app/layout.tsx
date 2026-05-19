import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider } from '@/components/ui/toast'

export const metadata: Metadata = {
  title: 'CifrasLouvor',
  description: 'Biblioteca de cifras do ministério de louvor',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full bg-gray-950 text-gray-100 antialiased">
        <ToastProvider>
          <div className="flex h-full">
            <Sidebar />
            <main className="flex-1 overflow-y-auto pt-14 md:pt-0 min-h-screen">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
