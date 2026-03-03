import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ElectionGrid } from '@/components/dashboard/ElectionGrid'
import { RepresentativesSection } from '@/components/representatives/RepresentativesSection'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard — Voter IQ',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, zipcode')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Your Ballot{profile?.first_name ? `, ${profile.first_name}` : ''}
          </h1>
          <p className="mt-2 text-gray-600">
            Upcoming elections
            {profile?.zipcode ? ` near ZIP code ${profile.zipcode}` : ''}.
            Click any election to get your personalized AI recommendations.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end shrink-0">
          <p className="text-xs text-gray-500 sm:text-right">Update your profile to refresh recommendations</p>
          <div className="flex gap-2">
            <Link
              href="/survey/demographic"
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Update Background
            </Link>
            <Link
              href="/survey/values"
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Update Values
            </Link>
          </div>
        </div>
      </div>

      <ElectionGrid />

      <div className="mt-14">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Representatives</h2>
          <p className="mt-1 text-gray-600">
            Elected officials currently serving
            {profile?.zipcode ? ` ZIP code ${profile.zipcode}` : ' your area'}.
            Click any representative to see their voting record and how well their actions align with your profile.
          </p>
        </div>
        <RepresentativesSection />
      </div>
    </div>
  )
}
