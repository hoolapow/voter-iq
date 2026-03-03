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
        <li key={i} className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
          <div className="flex gap-3 p-3">
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
          </div>
          {flag.context && (
            <details className="group border-t border-gray-100">
              <summary className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 cursor-pointer select-none hover:bg-gray-100 transition-colors list-none">
                <svg
                  className="w-3.5 h-3.5 transition-transform group-open:rotate-90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                Why might they have voted this way?
              </summary>
              <p className="px-3 pb-3 pt-1 text-xs text-gray-600 leading-relaxed">
                {flag.context}
              </p>
            </details>
          )}
        </li>
      ))}
    </ul>
  )
}
