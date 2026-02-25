'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { differenceInYears } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

const signupSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  birthday: z.string().refine((val) => {
    const date = new Date(val)
    if (isNaN(date.getTime())) return false
    return differenceInYears(new Date(), date) >= 18
  }, 'You must be at least 18 years old to register'),
  zipcode: z.string().regex(/^\d{5}$/, 'Enter a 5-digit ZIP code'),
})

type SignupValues = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) })

  async function onSubmit(values: SignupValues) {
    setServerError(null)
    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          first_name: values.first_name,
          last_name: values.last_name,
          birthday: values.birthday,
          zipcode: values.zipcode,
        },
      },
    })

    if (error) {
      setServerError(error.message)
      return
    }

    // If email confirmation is enabled, session will be null after signup.
    // Show a "check your email" message instead of redirecting.
    if (!data.session) {
      setNeedsConfirmation(true)
      return
    }

    // Email confirmation is disabled — session is live, go straight to survey.
    router.push('/survey/demographic')
    router.refresh()
  }

  if (needsConfirmation) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-2 text-sm text-gray-600 max-w-xs mx-auto">
            We sent a confirmation link to your email address. Click it to activate your account,
            then come back and sign in.
          </p>
          <div className="mt-6">
            <Link href="/auth/login" className="text-blue-600 hover:underline text-sm font-medium">
              Go to Sign In →
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="Jane"
              error={errors.first_name?.message}
              {...register('first_name')}
            />
            <Input
              label="Last Name"
              placeholder="Smith"
              error={errors.last_name?.message}
              {...register('last_name')}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="jane@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Birthday"
            type="date"
            error={errors.birthday?.message}
            helpText="You must be 18 or older to use Voter IQ"
            {...register('birthday')}
          />

          <Input
            label="ZIP Code"
            placeholder="90210"
            maxLength={5}
            error={errors.zipcode?.message}
            helpText="Used to find elections in your area"
            {...register('zipcode')}
          />

          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <Button type="submit" loading={isSubmitting} className="w-full mt-2">
            Create Account
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
