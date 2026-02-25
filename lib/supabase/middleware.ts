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

  // Helper: fetch profile once for all logged-in route checks below
  // Only runs when user is logged in and hitting a route that needs survey state
  const needsSurveyCheck =
    user &&
    (isAuthRoute ||
      pathname.startsWith('/survey') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/election'))

  if (needsSurveyCheck) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('survey_demographic_complete, survey_values_complete')
      .eq('id', user!.id)
      .single()

    const url = request.nextUrl.clone()
    const demoDone = profile?.survey_demographic_complete ?? false
    const valuesDone = profile?.survey_values_complete ?? false

    // Logged in + auth route → redirect based on survey state
    if (isAuthRoute) {
      if (!demoDone) {
        url.pathname = '/survey/demographic'
      } else if (!valuesDone) {
        url.pathname = '/survey/values'
      } else {
        url.pathname = '/dashboard'
      }
      return NextResponse.redirect(url)
    }

    // Logged in + dashboard or election → must have completed both surveys
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/election')) {
      if (!demoDone) {
        url.pathname = '/survey/demographic'
        return NextResponse.redirect(url)
      }
      if (!valuesDone) {
        url.pathname = '/survey/values'
        return NextResponse.redirect(url)
      }
    }

    // Logged in + survey route → enforce funnel order
    if (pathname.startsWith('/survey')) {
      if (!demoDone && pathname !== '/survey/demographic') {
        url.pathname = '/survey/demographic'
        return NextResponse.redirect(url)
      }
      if (demoDone && !valuesDone && pathname !== '/survey/values') {
        url.pathname = '/survey/values'
        return NextResponse.redirect(url)
      }
      if (demoDone && valuesDone) {
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
