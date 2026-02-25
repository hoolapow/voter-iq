'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const { user, loading } = useSupabase()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [surveysOpen, setSurveysOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSurveysOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🗳️</span>
            <span className="font-bold text-xl text-gray-900">Voter IQ</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm">Dashboard</Button>
                    </Link>

                    {/* Update Surveys dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setSurveysOpen((o) => !o)}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1 py-1"
                      >
                        Update Surveys
                        <svg className={`w-3.5 h-3.5 transition-transform ${surveysOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {surveysOpen && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-50">
                          <Link
                            href="/survey/demographic"
                            onClick={() => setSurveysOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Background Survey
                          </Link>
                          <Link
                            href="/survey/values"
                            onClick={() => setSurveysOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Values Survey
                          </Link>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSignOut}
                      loading={signingOut}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm">Sign In</Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="sm">Sign Up</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
