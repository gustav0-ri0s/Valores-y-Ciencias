import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
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

    const pathname = request.nextUrl.pathname

    // Public routes (login)
    if (pathname.startsWith('/login')) {
        if (user) {
            // Redirect to accessible area? Hard to know role here easily without DB query.
            // Just let them go to login, usually they will see "Already logged in" or redirect main.
            // For MVP, if logged in, maybe redirect to standard dashboard?
            // Let's leave them on login or redirect to /dashboard.
            // return NextResponse.redirect(new URL('/admin/dashboard', request.url)) 
        }
        return supabaseResponse
    }

    // Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        // We can't easily check role here without DB hit which is risky in middleware.
        // Rely on Layout/Page helper for Role check.
    }

    // Protect Teacher Routes
    if (pathname.startsWith('/teacher')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
