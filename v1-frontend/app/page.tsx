'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Support Banner */}
      <div className="mb-8 text-center animate-slide-down">
        <div className="inline-block bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 shadow-md border border-gray-200">
          <p className="text-sm font-medium text-gray-700">
            🤝 A collaboration between local government and community partners
          </p>
        </div>
      </div>

      {/* Hero Section - Split Layout */}
      <div className="card card-compact surface-pattern mb-16 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-6 animate-slide-up">
            <div>
              <h1 className="cc-heading-xl mb-4">
                Welcome to CareConnect
              </h1>
              <p className="cc-body-lg text-gray-600">
                A Government-Supported Portal for People Experiencing Homelessness
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">What You Can Do:</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <strong className="text-gray-900">Share Your Story</strong>
                    <p className="text-gray-600 text-sm">Record your voice to help others understand your journey</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <strong className="text-gray-900">Get Support Tools</strong>
                    <p className="text-gray-600 text-sm">Create QR codes and fundraising materials</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <strong className="text-gray-900">Connect with Community</strong>
                    <p className="text-gray-600 text-sm">Make it easy for people to help you</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Large Red Recording Button with Halo */}
          <div className="flex flex-col items-center justify-center py-8 lg:py-0 animate-scale-in">
            <Link 
              href="/tell-your-story"
              className="group relative"
              aria-label="Start recording your story"
            >
              {/* Subtle halo effect */}
              <div className="absolute inset-0 bg-red-100 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              
              {/* Main button */}
              <div className="relative btn-record btn-record-breathe h-56 w-56 flex flex-col items-center justify-center gap-4">
                <svg 
                  className="w-24 h-24 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
                <span className="text-2xl font-bold uppercase tracking-wider text-center leading-tight">
                  Press to<br />Tell Your Story
                </span>
              </div>
            </Link>

            {/* Reassurance text below button */}
            <div className="mt-8 text-center space-y-2 max-w-sm">
              <p className="text-base text-gray-700 font-medium">
                You're in control. You can stop at any time.
              </p>
              <p className="text-sm text-gray-600">
                Your story helps connect you with support and resources.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Your Story Section */}
      <div className="mb-16 animate-fade-in" style={{animationDelay: '100ms'}}>
        <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <div className="text-center mb-6">
            <div className="inline-block mb-3">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-amber-900 mb-2">Already Started Your Story?</h2>
            <p className="text-amber-800">Search for your profile to continue where you left off</p>
          </div>
          
          <div className="max-w-2xl mx-auto bg-white rounded-xl p-6 shadow-sm">
            <Link href="/resume-story" className="block">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg hover:from-amber-200 hover:to-orange-200 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900 text-lg">Find My Story</div>
                    <div className="text-sm text-gray-600">Search by name and contact info</div>
                  </div>
                </div>
                <svg className="w-6 h-6 text-amber-700 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            
            <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>You'll need the name and email or phone number you used when you saved your recording.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Services */}
      <div className="mb-16 animate-fade-in" style={{animationDelay: '200ms'}}>
        <div className="text-center mb-10">
          <h2 className="cc-heading-md mb-3">Additional Support Tools</h2>
          <p className="cc-body text-gray-600">Everything you need to connect with your community</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* QR Code Generation */}
          <div className="card card-hover card-compact group">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">QR Donations</h3>
              </div>
              <p className="text-gray-600 mb-6 flex-grow">
                Generate scannable codes for Cash App, Venmo, PayPal, and more. People can donate instantly by scanning.
              </p>
              <Link href="/qr-generator" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors group-hover:translate-x-1 transition-transform">
                Create QR Code
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* GoFundMe Draft */}
          <div className="card card-hover card-compact group">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Fundraiser Draft</h3>
              </div>
              <p className="text-gray-600 mb-6 flex-grow">
                Create a complete GoFundMe draft with guided steps. We'll help you tell your story effectively.
              </p>
              <Link href="/gfm/1-location" className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors group-hover:translate-x-1 transition-transform">
                Start Setup
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Get Support */}
          <div className="card card-hover card-compact group">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Get Support</h3>
              </div>
              <p className="text-gray-600 mb-6 flex-grow">
                Work with case managers and access local resources. We're here to help connect you with services.
              </p>
              <button className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 transition-colors group-hover:translate-x-1 transition-transform">
                Learn More
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Safety Banner */}
      <div className="card card-compact bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 mb-12">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Your Privacy & Safety</h3>
            <p className="text-gray-700 mb-4">
              Your information is secure. We don't share your personal details without your permission. 
              All recordings and documents are stored safely and only you decide who sees them.
            </p>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Secure data storage
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                You control your information
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No sharing without permission
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Support available 24/7
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Admin Access */}
      <div className="border-t border-gray-200 mt-12 pt-8 pb-8">
        <div className="text-center mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Staff & Administrator Access
          </h3>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6">
          {/* Donations */}
          <Link 
            href="/admin/donations" 
            className="flex flex-col items-center gap-2 text-gray-600 hover:text-[#1B3A5D] transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Donations</span>
          </Link>

          {/* System Health */}
          <Link 
            href="/admin/system-health" 
            className="flex flex-col items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-green-50 group-hover:bg-green-100 flex items-center justify-center transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium">System Health</span>
          </Link>

          {/* Knowledge Vault */}
          <Link 
            href="/admin/knowledge" 
            className="flex flex-col items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-sm font-medium">Knowledge Vault</span>
          </Link>

          {/* Pipeline Incidents */}
          <Link 
            href="/admin/knowledge/incidents" 
            className="flex flex-col items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Incidents</span>
          </Link>

          {/* Audit Logs */}
          <Link 
            href="/admin/knowledge/audit" 
            className="flex flex-col items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Audit Logs</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
