interface SurveyProgressProps {
  step: 1 | 2
}

export function SurveyProgress({ step }: SurveyProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">
          Step {step} of 2
        </span>
        <span className="text-sm text-gray-500">
          {step === 1 ? 'Socioeconomic Background' : 'Your Values'}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: step === 1 ? '50%' : '100%' }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <div className="flex flex-col items-center">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
            }`}
          >
            1
          </div>
          <span className="text-xs text-gray-500 mt-1">Background</span>
        </div>
        <div className="flex flex-col items-center">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
            }`}
          >
            2
          </div>
          <span className="text-xs text-gray-500 mt-1">Values</span>
        </div>
      </div>
    </div>
  )
}
