import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
        // If not admin, maybe teacher?
        if (profile?.role === 'teacher') redirect('/teacher/assignments')
        redirect('/login') // Fallback
    }

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
            <aside className="w-64 bg-white border-r border-slate-200 dark:bg-slate-950 dark:border-slate-800 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-lg">Admin Console</span>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    <NavLink href="/admin/dashboard">Year & Bimesters</NavLink>
                    <NavLink href="/admin/catalog">Catalog (Structure)</NavLink>
                    <NavLink href="/admin/teachers">Teachers</NavLink>
                    <NavLink href="/admin/students">Students</NavLink>
                    <NavLink href="/admin/assignments">Assignments</NavLink>
                </nav>
                <div className="p-4 border-t border-slate-200">
                    <div className="text-xs text-slate-500 mb-2 truncate">{user.email}</div>
                    <form action="/auth/signout" method="post">
                        {/* We'll need a signout route or client component button. For now simple link to login? 
                   Actually, let's make a signout button in a client component or just a simple form action if we had server actions.
                   Let's use a client component for SignOut later. For MVP layout: generic button.
               */}
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/login">Sign Out</Link>
                            {/* Note: This doesn't actually sign out without logic. I will add a SignOutButton component. */}
                        </Button>
                    </form>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100"
        >
            {children}
        </Link>
    )
}
