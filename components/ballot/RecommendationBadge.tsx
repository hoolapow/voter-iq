interface RecommendationBadgeProps {
  recommendation: string
  contestType: 'candidate' | 'referendum' | 'retention'
}

export function RecommendationBadge({ recommendation, contestType }: RecommendationBadgeProps) {
  const isYes = recommendation.toLowerCase().startsWith('vote yes') || recommendation.toLowerCase() === 'yes'
  const isNo = recommendation.toLowerCase().startsWith('vote no') || recommendation.toLowerCase() === 'no'

  let colorClass = 'bg-blue-100 text-blue-800 border-blue-200'
  let icon = '🤖'

  if (contestType === 'referendum') {
    if (isYes) {
      colorClass = 'bg-green-100 text-green-800 border-green-200'
      icon = '✅'
    } else if (isNo) {
      colorClass = 'bg-red-100 text-red-800 border-red-200'
      icon = '❌'
    }
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${colorClass}`}
    >
      <span>{icon}</span>
      <span>{recommendation}</span>
    </div>
  )
}
