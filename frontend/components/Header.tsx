"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Server } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  // Don't show header on system page (it has its own)
  if (pathname === "/system") {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-3xl font-black text-blue-900">
                CareConnect
              </div>
            </Link>
            <div className="hidden sm:block text-sm text-gray-600 font-medium border-l border-gray-300 pl-4">
              Community-Supported Homeless Initiative
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/about"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
              >
                About
              </Link>
              <Link
                href="/resources"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
              >
                Resources
              </Link>
              <Link
                href="/find"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
              >
                Find
              </Link>
              <Link
                href="/support"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
              >
                Support
              </Link>
            </nav>

            {/* System Health Button */}
            <Link
              href="/system"
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition group"
              title="System Diagnostics"
            >
              <Server size={16} className="group-hover:text-blue-600" />
              <span className="hidden sm:inline">System</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
