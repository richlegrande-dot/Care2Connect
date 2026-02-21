import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CareConnect V1 - Homeless Support Platform',
  description: 'Audio recording, QR donations, and GoFundMe draft creation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
          {/* Government-Style Header */}
          <header className="bg-[#1B3A5D] shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight uppercase">
                    CareConnect
                  </h1>
                  <p className="text-sm text-blue-200 mt-1 font-medium">
                    Government-Supported Homeless Support Initiative
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="text-right text-blue-100 text-xs">
                    <p className="font-semibold">Community Support Portal</p>
                    <p className="text-blue-300">Powered by Local Services</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {children}
          </main>

          {/* Government Footer */}
          <footer className="bg-white border-t-4 border-[#1B3A5D] mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-[#1B3A5D] uppercase tracking-wide mb-3">
                    Important Notice
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    CareConnect does not create accounts or submit fundraisers on your behalf. 
                    You must complete official identity verification and account setup processes yourself.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B3A5D] uppercase tracking-wide mb-3">
                    Support Services
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    This portal provides tools to help document your story and connect with potential donors. 
                    All services are provided as-is for community support purposes.
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  &copy; {new Date().getFullYear()} CareConnect Community Support Portal. 
                  <span className="mx-2">•</span>
                  Serving Those Experiencing Homelessness
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}