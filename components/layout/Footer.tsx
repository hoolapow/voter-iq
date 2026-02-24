import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗳️</span>
            <span className="font-bold text-white">Voter IQ</span>
            <span className="text-sm">— Personalized ballot guidance</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-xs">
          <p>Voter IQ provides nonpartisan, AI-assisted ballot guidance based on your stated values.</p>
          <p className="mt-1">Not affiliated with any political party or campaign.</p>
          <p className="mt-2">© {new Date().getFullYear()} Voter IQ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
