'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TeacherAssignmentsPage() {
    const [assignments, setAssignments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchAssignments = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Get Teacher ID from Profile
            const { data: teacher } = await supabase.from('teachers').select('id').eq('profile_id', user.id).single()

            // If admin is viewing, they might not have a teacher record linked to their profile.
            // For demo purposes, if no teacher record found, show empty or warning.
            if (!teacher) {
                // Check if admin?
                setLoading(false)
                return
            }

            // 2. Get Active Assignments
            // Need to join with Academic Year to ensure it's open? Or just list all?
            // "Active in the year".
            const { data } = await supabase.from('teacher_assignments')
                .select(`
                    id,
                    courses(name),
                    grades(name),
                    sections(name),
                    academic_years(name, status)
                `)
                .eq('teacher_id', teacher.id)
                .order('created_at', { ascending: false })

            if (data) setAssignments(data)
            setLoading(false)
        }
        fetchAssignments()
    }, [])

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Assignments</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map(a => (
                    <Card key={a.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle>{a.courses.name}</CardTitle>
                            <div className="text-sm text-slate-500">
                                {a.grades.name} - {a.sections?.name || 'All Sections'}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <span className={`text-xs px-2 py-1 rounded ${a.academic_years.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-slate-100'}`}>
                                    {a.academic_years.name} ({a.academic_years.status})
                                </span>
                            </div>
                            <Button asChild className="w-full">
                                <Link href={`/teacher/gradebook/${a.id}`}>Open Gradebook</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {assignments.length === 0 && (
                    <div className="col-span-3 text-center text-slate-500 py-10">
                        No assignments found. Please contact the administrator.
                    </div>
                )}
            </div>
        </div>
    )
}
