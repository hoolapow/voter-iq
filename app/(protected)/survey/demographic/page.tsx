import { createClient } from '@/lib/supabase/server'
import { SurveyProgress } from '@/components/survey/SurveyProgress'
import { DemographicForm } from '@/components/survey/DemographicForm'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Survey: Background — Voter IQ',
}

export default async function DemographicSurveyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('survey_demographic_complete')
    .eq('id', user!.id)
    .single()

  const isRetake = profile?.survey_demographic_complete === true

  // Pre-populate with existing answers if retaking
  const { data: existing } = isRetake
    ? await supabase.from('survey_demographic').select('*').eq('user_id', user!.id).single()
    : { data: null }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {!isRetake && <SurveyProgress step={1} />}
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-900">
            {isRetake ? 'Update Your Background' : 'About You'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isRetake
              ? 'Update your socioeconomic background. Your previous answers are pre-filled. Saving will refresh your ballot recommendations.'
              : 'Your socioeconomic background helps us understand which ballot issues affect you most. This information is private and never shared.'}
          </p>
        </CardHeader>
        <CardContent>
          <DemographicForm isRetake={isRetake} initialValues={existing ?? undefined} />
        </CardContent>
      </Card>
    </div>
  )
}
