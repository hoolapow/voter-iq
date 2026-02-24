import { createClient } from '@/lib/supabase/server'
import { ElectionGrid } from '@/components/dashboard/ElectionGrid'

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Your Ballot{profile?.first_name ? `, ${profile.first_name}` : ''}
        </h1>
        <p className="mt-2 text-gray-600">
          Upcoming elections
          {profile?.zipcode ? ` near ZIP code ${profile.zipcode}` : ''}.
          Click any election to get your personalized AI recommendations.
        </p>
      </div>

      <ElectionGrid />
    </div>
  )
}
