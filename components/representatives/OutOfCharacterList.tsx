import { OutOfCharacterFlag } from '@/lib/types/representative.types'

interface OutOfCharacterListProps {
  flags: OutOfCharacterFlag[]
}

function SeverityIcon({ severity }: { severity: OutOfCharacterFlag['severity'] }) {
  if (severity === 'strong') return <span className="text-red-500" title="Strong anomaly">🚨</span>
  if (severity === 'notable') return <span className="text-orange-400" title="Notable anomaly">🔶</span>
  return <span className="text-yellow-400" title="Mild anomaly">⚠️</span>
}

function severityBadge(severity: OutOfCharacterFlag['severity']) {
  if (severity === 'strong') return 'bg-red-100 text-red-700'
  if (severity === 'notable') return 'bg-orange-100 text-orange-700'
  return 'bg-yellow-100 text-yellow-700'
}

export function OutOfCharacterList({ flags }: OutOfCharacterListProps) {
  if (flags.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        No out-of-character votes or bills detected in this voting record.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {flags.map((flag, i) => (
        <li key={i} className="flex gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
          <SeverityIcon severity={flag.severity} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {flag.type === 'vote' ? 'Vote' : 'Bill'}
              </span>
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${severityBadge(flag.severity)}`}
              >
                {flag.severity}
              </span>
              <span className="text-xs text-gray-500 font-mono">{flag.item_id}</span>
            </div>
            <p className="text-sm text-gray-700">{flag.description}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
