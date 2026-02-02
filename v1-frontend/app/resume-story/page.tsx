'use client'

import { useState } from 'react'
import Link from 'next/link'

interface SearchForm {
  name: string
  email: string
  phone: string
  searchBy: 'email' | 'phone'
}

interface Recording {
  id: string
  audioUrl: string
  duration: number | null
  status: string
  createdAt: string
}

interface Profile {
  id: string
  name: string
  email: string | null
  phone: string | null
  createdAt: string
  recordings: Recording[]
}

export default function ResumeStoryPage() {
  const [searchForm, setSearchForm] = useState<SearchForm>({
    name: '',
    email: '',
    phone: '',
    searchBy: 'email'
  })
  
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    // Validation
    if (!searchForm.name.trim()) {
      setSearchError('Please enter your name')
      return
    }
    
    const contactValue = searchForm.searchBy === 'email' ? searchForm.email : searchForm.phone
    if (!contactValue.trim()) {
      setSearchError(`Please enter your ${searchForm.searchBy}`)
      return
    }
    
    setIsSearching(true)
    setSearchError(null)
    setHasSearched(false)
    
    try {
      const params = new URLSearchParams({
        name: searchForm.name.trim()
      })
      
      if (searchForm.searchBy === 'email') {
        params.append('email', searchForm.email.trim())
      } else {
        params.append('phone', searchForm.phone.trim())
      }
      
      const response = await fetch(`http://localhost:3001/api/profiles/search?${params}`)
      
      if (response.ok) {
        const result = await response.json()
        setSearchResults(result.profiles || [])
        setHasSearched(true)
      } else {
        const error = await response.json()
        setSearchError(error.error || 'Search failed. Please try again.')
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchError('Search failed. Please check your connection.')
    } finally {
      setIsSearching(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown duration'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-down">
        <div className="inline-block bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4 shadow-md">
          Resume Your Story
        </div>
        <h1 className="cc-heading-lg mb-3">Find Your Recording</h1>
        <p className="cc-body-lg text-gray-600">
          Search for your profile using the information you provided when you saved your story
        </p>
      </div>

      {/* Search Form */}
      <div className="card mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Search for Your Profile</h2>
        </div>

        <div className="space-y-5">
          {/* Name Field */}
          <div>
            <label htmlFor="search-name" className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="search-name"
              value={searchForm.name}
              onChange={(e) => setSearchForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-lg"
              placeholder="Enter the name you used"
            />
          </div>

          {/* Search By Toggle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Search By <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setSearchForm(prev => ({ ...prev, searchBy: 'email' }))}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  searchForm.searchBy === 'email'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📧 Email
              </button>
              <button
                onClick={() => setSearchForm(prev => ({ ...prev, searchBy: 'phone' }))}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  searchForm.searchBy === 'phone'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📱 Phone
              </button>
            </div>
          </div>

          {/* Contact Field */}
          {searchForm.searchBy === 'email' ? (
            <div>
              <label htmlFor="search-email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                id="search-email"
                value={searchForm.email}
                onChange={(e) => setSearchForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-lg"
                placeholder="your.email@example.com"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="search-phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                id="search-phone"
                value={searchForm.phone}
                onChange={(e) => setSearchForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-lg"
                placeholder="(555) 123-4567"
              />
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search for My Story
              </span>
            )}
          </button>

          {/* Error Message */}
          {searchError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ⚠️ {searchError}
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-xs text-gray-600 leading-relaxed">
              For your privacy, we require both your name and a contact method to access your profile. 
              We never display profiles publicly without this verification.
            </p>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="animate-fade-in">
          {searchResults.length === 0 ? (
            <div className="card bg-yellow-50 border-2 border-yellow-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-yellow-900 mb-2">No Stories Found</h3>
                <p className="text-yellow-800 mb-4">
                  We couldn't find any recordings matching your name and contact information.
                </p>
                <div className="space-y-2 text-sm text-yellow-700 text-left max-w-md mx-auto">
                  <p className="font-semibold">Double-check:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Is your name spelled exactly as you entered it before?</li>
                    <li>Are you using the same email or phone number?</li>
                    <li>Did you complete the profile form after recording?</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <Link href="/tell-your-story" className="btn-primary inline-block">
                    Record a New Story
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Found {searchResults.length} profile{searchResults.length !== 1 ? 's' : ''}</span>
              </div>

              {searchResults.map((profile) => (
                <div key={profile.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
                        <p className="text-sm text-gray-600">
                          Profile created {formatDate(profile.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recordings List */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                      </svg>
                      Your Recordings ({profile.recordings.length})
                    </h4>

                    {profile.recordings.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">No recordings yet</p>
                    ) : (
                      profile.recordings.map((recording) => (
                        <Link
                          key={recording.id}
                          href={`/story/${recording.id}`}
                          className="block p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  Recording from {formatDate(recording.createdAt)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Duration: {formatDuration(recording.duration)} • Status: {recording.status}
                                </div>
                              </div>
                            </div>
                            <svg className="w-6 h-6 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Back to Home */}
      <div className="mt-8 text-center">
        <Link href="/" className="btn-secondary inline-block">
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </span>
        </Link>
      </div>
    </div>
  )
}
