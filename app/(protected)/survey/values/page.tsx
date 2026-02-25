import { createClient } from '@/lib/supabase/server'
import { SurveyProgress } from '@/components/survey/SurveyProgress'
import { ValuesForm } from '@/components/survey/ValuesForm'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Survey: Values — Voter IQ',
}

export default async function ValuesSurveyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('survey_values_complete')
    .eq('id', user!.id)
    .single()

  const isRetake = profile?.survey_values_complete === true

  // Pre-populate with existing answers if retaking
  const { data: existing } = isRetake
    ? await supabase.from('survey_values').select('*').eq('user_id', user!.id).single()
    : { data: null }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {!isRetake && <SurveyProgress step={2} />}
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-900">
            {isRetake ? 'Update Your Values' : 'Your Political Values'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isRetake
              ? 'Update your policy values. Your previous answers are pre-filled. Saving will refresh your ballot recommendations.'
              : 'These sliders capture where you stand on key policy issues. Move each slider to where you feel most comfortable. There are no right or wrong answers.'}
          </p>
        </CardHeader>
        <CardContent>
          <ValuesForm isRetake={isRetake} initialValues={existing ?? undefined} />
        </CardContent>
      </Card>
    </div>
  )
}
