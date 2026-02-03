'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            // Check role to redirect appropriately
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Query profile to get role
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
                if (profile?.role === 'admin') {
                    router.push('/admin/dashboard')
                } else {
                    router.push('/teacher/assignments')
                }
            }
            setLoading(false)
        }
    }

    const handleSignUp = async () => {
        // Optional: For MVP, maybe we want an easy way to create the first admin?
        // Or just stick to "Admin creates users".
        // Let's allow signup for now as per "Auth (login/signup/logout)" requirement, 
        // but remember role defaults to 'teacher' via trigger.
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: 'New User'
                }
            }
        })
        if (error) {
            setError(error.message)
        } else {
            setError('Check your email for confirmation (or if auto-confirm is on, you are signed up).')
        }
        setLoading(false)
    }

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Academic Platform</CardTitle>
                    <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Loading...' : 'Sign In'}
                        </Button>
                        <div className="text-xs text-slate-500 text-center">
                            For demo: Sign up to create an account. First admin needs manual setup or SQL seed.
                        </div>
                        <Button type="button" variant="ghost" className="w-full h-auto py-1 text-xs" onClick={handleSignUp}>
                            Create Account (Teacher by default)
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
