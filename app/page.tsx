import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const FEATURES = [
  {
    icon: '🗳️',
    title: 'Your Local Ballot',
    description:
      'We automatically find upcoming elections for your ZIP code — local, state, and federal.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Recommendations',
    description:
      'Claude AI analyzes every candidate and ballot measure through the lens of your personal values.',
  },
  {
    icon: '🔒',
    title: 'Private & Nonpartisan',
    description:
      'Your responses are never sold or shared. Recommendations are based solely on your stated values, not party.',
  },
  {
    icon: '📖',
    title: 'Full Reasoning & Sources',
    description:
      'Every recommendation includes detailed reasoning and cited sources so you can verify for yourself.',
  },
  {
    icon: '⚡',
    title: 'Instant & Personalized',
    description:
      'Complete two short surveys once. Then get personalized ballot guidance for every election.',
  },
  {
    icon: '📍',
    title: 'Local to National',
    description:
      'From mayor races and school board measures to U.S. Senate — we cover your entire ballot.',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Create your account',
    description: 'Sign up in under a minute with your email and ZIP code.',
  },
  {
    step: '02',
    title: 'Complete two short surveys',
    description:
      'Tell us about your socioeconomic background and where you stand on key policy issues.',
  },
  {
    step: '03',
    title: 'See your personalized ballot',
    description:
      'For every upcoming election, get AI-generated recommendations with full reasoning and sources.',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-700/50 backdrop-blur-sm border border-blue-500/50 rounded-full px-4 py-2 text-sm mb-8">
            <span>🇺🇸</span>
            <span>Nonpartisan · AI-Powered · Private</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight">
            Your personalized
            <br />
            <span className="text-blue-300">ballot guide</span>
          </h1>

          <p className="mt-6 text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Tell us your values once. Get AI-powered, nonpartisan recommendations for every
            candidate and ballot measure on your ballot — with full reasoning and sources.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 w-full sm:w-auto">
                Get My Ballot Guide — Free
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="ghost"
                className="text-white border border-white/30 hover:bg-white/10 w-full sm:w-auto"
              >
                How It Works
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-blue-300">
            Takes about 3 minutes to set up. No credit card required.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">How Voter IQ works</h2>
            <p className="mt-3 text-gray-600">Three simple steps to your personalized ballot</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Why Voter IQ</h2>
            <p className="mt-3 text-gray-600">Everything you need to vote with confidence</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to vote smarter?</h2>
          <p className="mt-4 text-blue-200 text-lg">
            Join thousands of voters who use Voter IQ to understand their ballot before election day.
          </p>
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="mt-8 bg-white text-blue-900 hover:bg-blue-50"
            >
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
