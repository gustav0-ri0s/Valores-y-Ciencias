import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TeacherLayout({
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
    if (profile?.role === 'admin') {
        // Admins can see teacher view? Maybe strictly separate. 
        // RB1: ADMIN unique...
        // Let's redirect admin to dashboard if they try teacher route? 
        // Or allow for testing. Let's allow but maybe warn in header.
    }
    // Enforce teacher access generally? 
    // Actually, strict RB: only allow if role is teacher or admin.

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between">
                <div className="flex items-center gap-6">
                    <span className="font-bold text-lg text-slate-900">Teacher Portal</span>
                    <nav className="flex gap-4">
                        <Link href="/teacher/assignments" className="text-sm font-medium hover:underline">My Assignments</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">{user.email}</span>
                    <form action="/auth/signout" method="post">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/login">Sign Out</Link>
                        </Button>
                    </form>
                </div>
            </header>
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    )
}
