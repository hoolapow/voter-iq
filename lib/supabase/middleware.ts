import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/lib/types/database.types'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isAuthRoute = pathname.startsWith('/auth/')
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/election') ||
    pathname.startsWith('/survey')

  // Not logged in + protected route → login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Logged in + auth route → redirect based on survey state
  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('survey_demographic_complete, survey_values_complete')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()

    if (!profile?.survey_demographic_complete) {
      url.pathname = '/survey/demographic'
    } else if (!profile?.survey_values_complete) {
      url.pathname = '/survey/values'
    } else {
      url.pathname = '/dashboard'
    }

    return NextResponse.redirect(url)
  }

  // Logged in, hitting /survey routes — enforce funnel order
  if (user && pathname.startsWith('/survey')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('survey_demographic_complete, survey_values_complete')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()

    if (!profile?.survey_demographic_complete && pathname !== '/survey/demographic') {
      url.pathname = '/survey/demographic'
      return NextResponse.redirect(url)
    }

    if (
      profile?.survey_demographic_complete &&
      !profile?.survey_values_complete &&
      pathname !== '/survey/values'
    ) {
      url.pathname = '/survey/values'
      return NextResponse.redirect(url)
    }

    if (profile?.survey_demographic_complete && profile?.survey_values_complete) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
