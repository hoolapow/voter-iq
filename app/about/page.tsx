import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const metadata = {
  title: 'About — Voter IQ',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About Voter IQ</h1>

      <div className="space-y-8 text-gray-700">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
          <p className="text-lg leading-relaxed">
            Voter IQ exists to help every American voter understand their ballot — not by telling
            them what to think, but by providing personalized, AI-assisted guidance rooted in their
            own stated values.
          </p>
          <p className="mt-3 leading-relaxed">
            Democracy works best when citizens are informed. Yet ballots are often long, confusing,
            and filled with races and measures that receive little media attention. We believe every
            voter deserves a trusted, private advisor that meets them where they are.
          </p>
        </section>

        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="space-y-5">
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                1
              </span>
              <div>
                <strong className="text-gray-900">You tell us about yourself.</strong>
                <p className="mt-1 leading-relaxed">
                  Two short surveys capture your socioeconomic background and where you stand on
                  nine key policy issues, using simple 1–5 sliders.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                2
              </span>
              <div>
                <strong className="text-gray-900">We find your ballot.</strong>
                <p className="mt-1 leading-relaxed">
                  Using your ZIP code, we identify upcoming elections and every contest on your
                  ballot — candidates, referendums, and retention votes.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                3
              </span>
              <div>
                <strong className="text-gray-900">Claude AI generates your recommendation.</strong>
                <p className="mt-1 leading-relaxed">
                  We use Anthropic&apos;s Claude AI model to analyze each contest through the lens of
                  your specific profile. Every recommendation includes detailed reasoning and cited
                  sources.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Privacy &amp; Security</h2>
          <p className="leading-relaxed">
            Your survey responses, profile data, and recommendations are stored securely and are
            never shared with third parties, sold to advertisers, or used for political targeting.
            We use row-level security so your data is accessible only to you.
          </p>
          <p className="mt-3 leading-relaxed">
            Voter IQ is not affiliated with any political party, campaign, PAC, or advocacy
            organization. It is an independent civic technology project.
          </p>
        </section>

        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">A Note on AI</h2>
          <p className="leading-relaxed">
            AI recommendations are a starting point, not a final word. We encourage all users to
            read the full reasoning provided, review the cited sources, and conduct their own
            research before casting their ballot. No AI system is perfect — Voter IQ recommendations
            may contain errors or omissions.
          </p>
        </section>

        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/auth/signup">
            <Button size="lg">Get Started — It&apos;s Free</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" size="lg">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
