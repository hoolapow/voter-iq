import { RepresentativeBill, PolicyArea } from '@/lib/types/representative.types'

interface BillsListProps {
  bills: RepresentativeBill[]
}

const POLICY_LABELS: Record<PolicyArea, string> = {
  environment: 'Environment',
  safety_net: 'Safety Net',
  guns: 'Guns',
  immigration: 'Immigration',
  healthcare: 'Healthcare',
  abortion: 'Abortion',
  education: 'Education',
  criminal_justice: 'Criminal Justice',
  lgbtq_rights: 'LGBTQ+ Rights',
  other: 'Other',
}

const POLICY_COLORS: Record<PolicyArea, string> = {
  environment: 'bg-green-100 text-green-800',
  safety_net: 'bg-purple-100 text-purple-800',
  guns: 'bg-orange-100 text-orange-800',
  immigration: 'bg-yellow-100 text-yellow-800',
  healthcare: 'bg-blue-100 text-blue-800',
  abortion: 'bg-pink-100 text-pink-800',
  education: 'bg-indigo-100 text-indigo-800',
  criminal_justice: 'bg-red-100 text-red-800',
  lgbtq_rights: 'bg-fuchsia-100 text-fuchsia-800',
  other: 'bg-gray-100 text-gray-700',
}

function statusBadge(status: string | null) {
  if (!status) return 'bg-gray-100 text-gray-500'
  const s = status.toLowerCase()
  if (s.includes('signed') || s.includes('enacted') || s.includes('passed')) return 'bg-green-100 text-green-800'
  if (s.includes('fail') || s.includes('vetoed')) return 'bg-red-100 text-red-800'
  if (s.includes('committee')) return 'bg-amber-100 text-amber-800'
  return 'bg-gray-100 text-gray-600'
}

function BillRow({ bill }: { bill: RepresentativeBill }) {
  return (
    <li className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-mono text-xs text-gray-500">{bill.bill_number}</span>
          {bill.policy_area && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                POLICY_COLORS[bill.policy_area as PolicyArea]
              }`}
            >
              {POLICY_LABELS[bill.policy_area as PolicyArea]}
            </span>
          )}
          {bill.status && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(bill.status)}`}>
              {bill.status}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-800">{bill.bill_title}</p>
        {bill.status_date && (
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(bill.status_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    </li>
  )
}

export function BillsList({ bills }: BillsListProps) {
  if (bills.length === 0) {
    return <p className="text-sm text-gray-500 italic">No bill sponsorships available.</p>
  }

  const sponsored = bills.filter((b) => b.sponsorship_type === 'primary')
  const cosponsored = bills.filter((b) => b.sponsorship_type === 'cosponsor')

  return (
    <div className="space-y-8">
      {sponsored.length > 0 && (
        <section>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Sponsored Bills ({sponsored.length})
          </h4>
          <ul>
            {sponsored.map((bill) => (
              <BillRow key={bill.id} bill={bill} />
            ))}
          </ul>
        </section>
      )}
      {cosponsored.length > 0 && (
        <section>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Co-Sponsored Bills ({cosponsored.length})
          </h4>
          <ul>
            {cosponsored.map((bill) => (
              <BillRow key={bill.id} bill={bill} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
