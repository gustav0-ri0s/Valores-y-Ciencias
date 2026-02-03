'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input' // Might need custom small inputs
import { Label } from '@/components/ui/label'

const GRADES = ['AD', 'A', 'B', 'C']

export default function GradebookPage() {
    const params = useParams()
    const assignmentId = params.id as string
    const supabase = createClient()

    const [assignment, setAssignment] = useState<any>(null)
    const [bimesters, setBimesters] = useState<any[]>([])
    const [activeBimester, setActiveBimester] = useState<any>(null)

    // Data
    const [students, setStudents] = useState<any[]>([])
    // Maps: student_id -> value
    const [grades, setGrades] = useState<Record<string, string>>({})
    const [attendance, setAttendance] = useState<Record<string, any>>({}) // { attendances, absences, justifications }
    const [appreciations, setAppreciations] = useState<Record<string, string>>({})

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (assignmentId) fetchContext()
    }, [assignmentId])

    useEffect(() => {
        if (activeBimester && assignment) fetchData()
    }, [activeBimester, assignment])

    const fetchContext = async () => {
        // 1. Get Assignment Details + Year
        const { data: a } = await supabase.from('teacher_assignments')
            .select('*, grades(name), sections(name), courses(name)')
            .eq('id', assignmentId)
            .single()

        if (a) {
            setAssignment(a)
            // 2. Get Bimesters for Year
            const { data: b } = await supabase.from('bimesters')
                .select('*')
                .eq('year_id', a.year_id)
                .order('number')

            if (b) {
                setBimesters(b)
                // Default to first open or just first
                const open = b.find((x: any) => x.status === 'open_fill')
                setActiveBimester(open || b[0])
            }
        }
    }

    const fetchData = async () => {
        setLoading(true)
        // 1. Get Students
        const { data: s } = await supabase.from('students')
            .select(`*, enrollments!inner(year_id)`) // Use inner join on enrollments to filter by year if needed, OR just filter by grade/section
        // Enrollment logic: Student must be in Grade/Section/Year.
        // Simplified for MVP: Filter by grade_id and section_id if present.
        // But students table has current grade/section.
        // PROPER WAY: Join enrollments for the specific year.
        // Schema 003.C: enrollments(year_id, student_id, grade_id, section_id).
        // We need students enrolled in (assignment.grade_id) and (assignment.section_id or ANY if null) for (assignment.year_id)

        // Let's filter enrollments
        let query = supabase.from('enrollments')
            .select('student_id, students(*)')
            .eq('year_id', assignment.year_id)
            .eq('grade_id', assignment.grade_id)

        if (assignment.section_id) {
            query = query.eq('section_id', assignment.section_id)
        }

        const { data: enrollmentData } = await query
        const studentList = enrollmentData?.map((e: any) => e.students) || []

        // Sort by name
        studentList.sort((a: any, b: any) => a.last_names.localeCompare(b.last_names))
        setStudents(studentList)

        if (studentList.length > 0) {
            // 2. Get Grades
            const { data: g } = await supabase.from('qualitative_grades')
                .select('student_id, value')
                .eq('assignment_id', assignmentId)
                .eq('bimester_id', activeBimester.id)
                .in('student_id', studentList.map(x => x.id))

            const gMap: any = {}
            g?.forEach((x: any) => gMap[x.student_id] = x.value)
            setGrades(gMap)

            // 3. Get Attendance
            const { data: att } = await supabase.from('attendance_bimester')
                .select('student_id, attendances, absences, justifications')
                .eq('bimester_id', activeBimester.id)
                .in('student_id', studentList.map(x => x.id))

            const attMap: any = {}
            att?.forEach((x: any) => attMap[x.student_id] = x)
            setAttendance(attMap)

            // 4. Get Appreciations
            const { data: app } = await supabase.from('tutor_appreciations')
                .select('student_id, text')
                .eq('bimester_id', activeBimester.id)
                .in('student_id', studentList.map(x => x.id))

            const appMap: any = {}
            app?.forEach((x: any) => appMap[x.student_id] = x.text)
            setAppreciations(appMap)
        }

        setLoading(false)
    }

    const handleSave = async (studentId: string, type: 'grade' | 'attendance' | 'appreciation', value: any) => {
        if (activeBimester.status !== 'open_fill') return
        // Optimistic update
        if (type === 'grade') setGrades(prev => ({ ...prev, [studentId]: value }))
        if (type === 'appreciation') setAppreciations(prev => ({ ...prev, [studentId]: value }))
        if (type === 'attendance') setAttendance(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || { attendances: 0, absences: 0, justifications: 0 }), ...value } }))

        // DB Update
        if (type === 'grade') {
            await supabase.from('qualitative_grades').upsert({
                bimester_id: activeBimester.id,
                assignment_id: assignmentId,
                student_id: studentId,
                value: value
            }, { onConflict: 'bimester_id,assignment_id,student_id' })
        }
        if (type === 'attendance') {
            const current = attendance[studentId] || { attendances: 0, absences: 0, justifications: 0 }
            const newValue = { ...current, ...value }
            await supabase.from('attendance_bimester').upsert({
                bimester_id: activeBimester.id,
                student_id: studentId,
                ...newValue
            }, { onConflict: 'bimester_id,student_id' })
        }
        if (type === 'appreciation') {
            await supabase.from('tutor_appreciations').upsert({
                bimester_id: activeBimester.id,
                student_id: studentId,
                text: value
            }, { onConflict: 'bimester_id,student_id' })
        }
    }

    if (!assignment) return <div>Loading Assignment...</div>

    const isLocked = activeBimester?.status !== 'open_fill'

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">{assignment.courses.name}</h1>
                    <p className="text-slate-500">{assignment.grades.name} - {assignment.sections?.name || 'All Sections'}</p>
                </div>
                <div className="flex gap-2">
                    {bimesters.map(b => (
                        <Button
                            key={b.id}
                            variant={activeBimester?.id === b.id ? 'default' : 'outline'}
                            onClick={() => setActiveBimester(b)}
                            className={b.status !== 'open_fill' ? 'opacity-75' : ''}
                        >
                            B{b.number} {b.status !== 'open_fill' && '🔒'}
                        </Button>
                    ))}
                </div>
            </div>

            {isLocked && (
                <div className="bg-amber-100 text-amber-800 p-3 rounded-md border border-amber-200">
                    ⚠️ This bimester is closed. Grading is active only for open bimesters.
                </div>
            )}

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-4 text-left w-64">Student</th>
                                    <th className="p-4 text-center w-32">Grade</th>
                                    <th className="p-4 text-center w-64">Attendance (Att | Abs | Just)</th>
                                    <th className="p-4 text-left">Appreciation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {students.map(s => {
                                    const att = attendance[s.id] || { attendances: 0, absences: 0, justifications: 0 }
                                    return (
                                        <tr key={s.id} className="hover:bg-slate-50">
                                            <td className="p-4 font-medium">
                                                {s.last_names}, {s.first_names}
                                                <div className="text-xs text-slate-400">{s.dni}</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <select
                                                    className="border rounded px-2 py-1 w-full disabled:opacity-50"
                                                    value={grades[s.id] || ''}
                                                    onChange={e => handleSave(s.id, 'grade', e.target.value)}
                                                    disabled={isLocked}
                                                >
                                                    <option value="">-</option>
                                                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2 justify-center">
                                                    <Input
                                                        type="number" className="h-8 w-16 text-center px-1" placeholder="Att"
                                                        value={att.attendances || ''}
                                                        onChange={e => handleSave(s.id, 'attendance', { attendances: parseInt(e.target.value) || 0 })}
                                                        disabled={isLocked}
                                                    />
                                                    <Input
                                                        type="number" className="h-8 w-16 text-center px-1" placeholder="Abs"
                                                        value={att.absences || ''}
                                                        onChange={e => handleSave(s.id, 'attendance', { absences: parseInt(e.target.value) || 0 })}
                                                        disabled={isLocked}
                                                    />
                                                    <Input
                                                        type="number" className="h-8 w-16 text-center px-1" placeholder="Just"
                                                        value={att.justifications || ''}
                                                        onChange={e => handleSave(s.id, 'attendance', { justifications: parseInt(e.target.value) || 0 })}
                                                        disabled={isLocked}
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Input
                                                    className="h-8 w-full"
                                                    placeholder="Comment..."
                                                    value={appreciations[s.id] || ''}
                                                    onChange={e => {
                                                        setAppreciations(prev => ({ ...prev, [s.id]: e.target.value })) // Local state for input speed
                                                    }}
                                                    onBlur={e => handleSave(s.id, 'appreciation', e.target.value)}
                                                    disabled={isLocked}
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {students.length === 0 && !loading && <div className="p-8 text-center text-slate-500">No students found in this course/section.</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
