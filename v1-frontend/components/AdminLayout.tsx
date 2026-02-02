'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface AdminNavItem {
  name: string
  href: string
  icon: string
}

const navItems: AdminNavItem[] = [
  { name: 'Dashboard', href: '/admin/donations', icon: '📊' },
  { name: 'Story Browser', href: '/admin/story-browser', icon: '🎤' },
  { name: 'Recording Health', href: '/admin/recording-health', icon: '🏥' },
  { name: 'Donation Ledger', href: '/admin/donations/ledger', icon: '📋' },
  { name: 'Donor Statements', href: '/admin/donations/statements', icon: '📄' },
  { name: 'Email Statements', href: '/admin/donations/email-statements', icon: '📧' },
  { name: 'Payment Setup', href: '/admin/payments/configure', icon: '⚙️' },
  { name: 'Webhook Config', href: '/admin/payments/webhook-setup', icon: '🔗' }
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1B3A5D] text-white flex-shrink-0">
        <div className="p-6">
          {/* Admin Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wide">Admin</h2>
                <p className="text-xs text-blue-200">CareConnect Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-white text-[#1B3A5D] font-bold shadow-lg' 
                      : 'text-blue-100 hover:bg-[#0F2438] hover:text-white'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Return to Portal */}
          <div className="mt-12 pt-6 border-t border-blue-400">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-[#0F2438] hover:text-white transition-all"
            >
              <span className="text-xl">🏠</span>
              <span className="text-sm">Return to Portal</span>
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#0F2438]">
          <div className="text-xs text-blue-300 space-y-1">
            <p className="font-semibold">Administrator Access</p>
            <p>Secure Portal • V1.7</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
