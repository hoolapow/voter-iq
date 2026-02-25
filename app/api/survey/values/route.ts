import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'

type ValuesInsert = Database['public']['Tables']['survey_values']['Insert']

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('survey_values')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as Omit<ValuesInsert, 'user_id'>

  // Check if this is a retake (survey already completed)
  const { data: profile } = await supabase
    .from('profiles')
    .select('survey_values_complete')
    .eq('id', user.id)
    .single()

  const isRetake = profile?.survey_values_complete === true

  // Save to history on every submission
  await supabase.from('survey_values_history').insert({
    user_id: user.id,
    ...body,
  })

  // Upsert current (latest) version
  const { error: surveyError } = await supabase
    .from('survey_values')
    .upsert(
      {
        user_id: user.id,
        ...body,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (surveyError) {
    console.error('Survey values upsert error:', surveyError)
    return NextResponse.json({ error: surveyError.message }, { status: 500 })
  }

  // Mark values survey complete on profile
  const profileUpdate: Database['public']['Tables']['profiles']['Update'] = {
    survey_values_complete: true,
    updated_at: new Date().toISOString(),
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update(profileUpdate)
    .eq('id', user.id)

  if (profileError) {
    console.error('Profile update error:', profileError)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // On retake: delete cached recommendations so they regenerate with new data
  if (isRetake) {
    await supabase.from('recommendations').delete().eq('user_id', user.id)
  }

  return NextResponse.json({ success: true, isRetake })
}
