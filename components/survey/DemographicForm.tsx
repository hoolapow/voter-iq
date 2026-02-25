'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
  INCOME_RANGES,
  EMPLOYMENT_STATUSES,
  EDUCATION_LEVELS,
  HOME_OWNERSHIPS,
  MARITAL_STATUSES,
  HEALTH_INSURANCES,
} from '@/lib/types/survey.types'

const selectField = (msg = 'Required') =>
  z.string().min(1, msg).optional().default('')

const schema = z.object({
  income_range: selectField(),
  employment_status: selectField(),
  education_level: selectField(),
  children_count: z.number().min(0).max(20),
  household_size: z.number().min(1).max(20),
  home_ownership: selectField(),
  marital_status: selectField(),
  health_insurance: selectField(),
  military_service: z.boolean(),
  union_member: z.boolean(),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormValues = z.infer<typeof schema>
// Cast resolver to avoid z.coerce type mismatch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolver = zodResolver(schema) as any

interface DemographicFormProps {
  isRetake?: boolean
  initialValues?: Partial<FormValues>
}

export function DemographicForm({ isRetake = false, initialValues }: DemographicFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver,
    defaultValues: {
      income_range: initialValues?.income_range ?? '',
      employment_status: initialValues?.employment_status ?? '',
      education_level: initialValues?.education_level ?? '',
      children_count: initialValues?.children_count ?? 0,
      household_size: initialValues?.household_size ?? 1,
      home_ownership: initialValues?.home_ownership ?? '',
      marital_status: initialValues?.marital_status ?? '',
      health_insurance: initialValues?.health_insurance ?? '',
      military_service: initialValues?.military_service ?? false,
      union_member: initialValues?.union_member ?? false,
    },
  })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const res = await fetch('/api/survey/demographic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setServerError(data.error || 'Failed to save. Please try again.')
      return
    }

    if (isRetake) {
      router.push('/dashboard')
    } else {
      router.push('/survey/values')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Controller
        name="income_range"
        control={control}
        render={({ field }) => (
          <Select
            label="Annual Household Income"
            options={INCOME_RANGES}
            placeholder="Select income range"
            error={errors.income_range?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="employment_status"
        control={control}
        render={({ field }) => (
          <Select
            label="Employment Status"
            options={EMPLOYMENT_STATUSES}
            placeholder="Select status"
            error={errors.employment_status?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="education_level"
        control={control}
        render={({ field }) => (
          <Select
            label="Highest Education Level"
            options={EDUCATION_LEVELS}
            placeholder="Select level"
            error={errors.education_level?.message}
            {...field}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Number of Children"
          type="number"
          min={0}
          max={20}
          error={errors.children_count?.message}
          {...register('children_count', { valueAsNumber: true })}
        />
        <Input
          label="Household Size"
          type="number"
          min={1}
          max={20}
          error={errors.household_size?.message}
          {...register('household_size', { valueAsNumber: true })}
        />
      </div>

      <Controller
        name="home_ownership"
        control={control}
        render={({ field }) => (
          <Select
            label="Home Ownership"
            options={HOME_OWNERSHIPS}
            placeholder="Select"
            error={errors.home_ownership?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="marital_status"
        control={control}
        render={({ field }) => (
          <Select
            label="Marital Status"
            options={MARITAL_STATUSES}
            placeholder="Select"
            error={errors.marital_status?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="health_insurance"
        control={control}
        render={({ field }) => (
          <Select
            label="Health Insurance"
            options={HEALTH_INSURANCES}
            placeholder="Select coverage type"
            error={errors.health_insurance?.message}
            {...field}
          />
        )}
      />

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">Additional Background</label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            {...register('military_service')}
          />
          <span className="text-sm text-gray-700">Current or former military / veteran</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            {...register('union_member')}
          />
          <span className="text-sm text-gray-700">Current union member</span>
        </label>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <Button type="submit" loading={isSubmitting} size="lg" className="w-full">
        {isRetake ? 'Save Updates →' : 'Continue to Values Survey →'}
      </Button>
    </form>
  )
}
