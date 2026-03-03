'use client'

interface AlignmentBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

function scoreColor(score: number): { ring: string; text: string; bg: string } {
  if (score <= 40) return { ring: 'ring-red-400', text: 'text-red-700', bg: 'bg-red-50' }
  if (score <= 65) return { ring: 'ring-amber-400', text: 'text-amber-700', bg: 'bg-amber-50' }
  if (score <= 80) return { ring: 'ring-blue-400', text: 'text-blue-700', bg: 'bg-blue-50' }
  return { ring: 'ring-green-400', text: 'text-green-700', bg: 'bg-green-50' }
}

export function AlignmentBadge({ score, size = 'md' }: AlignmentBadgeProps) {
  const colors = scoreColor(score)
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-lg',
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizeClasses[size]} ${colors.bg} ${colors.ring} ring-2 rounded-full flex items-center justify-center font-bold ${colors.text}`}
      >
        {score}%
      </div>
      {size !== 'sm' && (
        <span className={`text-xs ${colors.text} font-medium`}>aligned</span>
      )}
    </div>
  )
}
