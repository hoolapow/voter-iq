import { SurveyProgress } from '@/components/survey/SurveyProgress'
import { DemographicForm } from '@/components/survey/DemographicForm'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export const metadata = {
  title: 'Survey: Background — Voter IQ',
}

export default function DemographicSurveyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <SurveyProgress step={1} />
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-900">About You</h1>
          <p className="mt-1 text-sm text-gray-600">
            Your socioeconomic background helps us understand which ballot issues affect you most.
            This information is private and never shared.
          </p>
        </CardHeader>
        <CardContent>
          <DemographicForm />
        </CardContent>
      </Card>
    </div>
  )
}
