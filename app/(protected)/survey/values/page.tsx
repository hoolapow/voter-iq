import { SurveyProgress } from '@/components/survey/SurveyProgress'
import { ValuesForm } from '@/components/survey/ValuesForm'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export const metadata = {
  title: 'Survey: Values — Voter IQ',
}

export default function ValuesSurveyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <SurveyProgress step={2} />
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-900">Your Political Values</h1>
          <p className="mt-1 text-sm text-gray-600">
            These sliders capture where you stand on key policy issues. Move each slider to where
            you feel most comfortable. There are no right or wrong answers.
          </p>
        </CardHeader>
        <CardContent>
          <ValuesForm />
        </CardContent>
      </Card>
    </div>
  )
}
