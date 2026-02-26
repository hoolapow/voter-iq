import dynamic from 'next/dynamic'

const VotingMap = dynamic(
  () => import('@/components/map/VotingMap').then((m) => m.VotingMap),
  { ssr: false }
)

export default function MapPage() {
  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-900">Voting Map</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Click any county to see upcoming elections and ballot contests for that area.
        </p>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <VotingMap />
      </div>
    </div>
  )
}
