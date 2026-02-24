'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Select } from '@/components/ui/Select'
import { Slider } from '@/components/ui/Slider'
import { Button } from '@/components/ui/Button'
import { RELIGIONS, VALUES_SLIDERS } from '@/lib/types/survey.types'

const schema = z.object({
  religion: z.string().min(1, 'Required'),
  religion_importance: z.number().min(1).max(5),
  environment: z.number().min(1).max(5),
  safety_net: z.number().min(1).max(5),
  guns: z.number().min(1).max(5),
  immigration: z.number().min(1).max(5),
  healthcare: z.number().min(1).max(5),
  abortion: z.number().min(1).max(5),
  education: z.number().min(1).max(5),
  criminal_justice: z.number().min(1).max(5),
  lgbtq_rights: z.number().min(1).max(5),
})

type FormValues = z.infer<typeof schema>

const DEFAULT_VALUES: FormValues = {
  religion: '',
  religion_importance: 3,
  environment: 3,
  safety_net: 3,
  guns: 3,
  immigration: 3,
  healthcare: 3,
  abortion: 3,
  education: 3,
  criminal_justice: 3,
  lgbtq_rights: 3,
}

export function ValuesForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const res = await fetch('/api/survey/values', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setServerError(data.error || 'Failed to save. Please try again.')
      return
    }

    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Religion</h3>

        <Controller
          name="religion"
          control={control}
          render={({ field }) => (
            <Select
              label="Religious Affiliation"
              options={RELIGIONS}
              placeholder="Select"
              error={errors.religion?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="religion_importance"
          control={control}
          render={({ field }) => (
            <Slider
              label="How important is religion in your voting decisions?"
              leftLabel="Not important at all"
              rightLabel="Very important"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="border-t border-gray-200 pt-6 flex flex-col gap-6">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
          Policy Values
          <span className="ml-2 text-xs font-normal text-gray-500 normal-case">
            (1 = more progressive, 5 = more conservative)
          </span>
        </h3>

        {VALUES_SLIDERS.map((slider) => (
          <Controller
            key={slider.key}
            name={slider.key}
            control={control}
            render={({ field }) => (
              <Slider
                label={slider.label}
                leftLabel={slider.leftLabel}
                rightLabel={slider.rightLabel}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        ))}
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <Button type="submit" loading={isSubmitting} size="lg" className="w-full">
        See My Ballot Recommendations →
      </Button>
    </form>
  )
}
