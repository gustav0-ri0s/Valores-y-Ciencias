'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// NativeSelect defined below
import { Label } from '@/components/ui/label'

// Simple Native Select Component for speed
function NativeSelect({ label, value, onChange, options, disabled = false }: any) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
            >
                <option value="">Select...</option>
                {options.map((o: any) => (
                    <option key={o.id} value={o.id}>{o.name || o.label}</option>
                ))}
            </select>
        </div>
    )
}

export default function AssignmentsPage() {
    const [years, setYears] = useState<any[]>([])
    const [teachers, setTeachers] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [grades, setGrades] = useState<any[]>([])
    const [sections, setSections] = useState<any[]>([])

    const [selectedYear, setSelectedYear] = useState('')
    const [selectedTeacher, setSelectedTeacher] = useState('')
    const [selectedCourse, setSelectedCourse] = useState('')
    const [selectedGrade, setSelectedGrade] = useState('')
    const [selectedSection, setSelectedSection] = useState('')

    const [assignments, setAssignments] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        const init = async () => {
            const { data: y } = await supabase.from('academic_years').select('*').eq('status', 'open').order('created_at', { ascending: false })
            if (y) setYears(y)
            if (y && y.length > 0) setSelectedYear(y[0].id)

            const { data: t } = await supabase.from('teachers').select('id, profiles(full_name)').eq('active', true)
            if (t) setTeachers(t.map(x => ({ id: x.id, label: x.profiles?.full_name })))

            const { data: c } = await supabase.from('courses').select('*').eq('active', true)
            if (c) setCourses(c)

            const { data: g } = await supabase.from('grades').select('*, levels(name)').order('name')
            if (g) setGrades(g.map(x => ({ id: x.id, label: `${x.name} (${x.levels?.name})` })))
        }
        init()
    }, [])

    useEffect(() => {
        if (selectedGrade) {
            // Fetch Sections for Grade
            const fetchSections = async () => {
                const { data } = await supabase.from('sections').select('*').eq('grade_id', selectedGrade)
                if (data) setSections(data)
                else setSections([])
            }
            fetchSections()
        } else {
            setSections([])
        }
    }, [selectedGrade])

    useEffect(() => {
        if (selectedYear) fetchAssignments()
    }, [selectedYear])

    const fetchAssignments = async () => {
        if (!selectedYear) return
        const { data } = await supabase.from('teacher_assignments')
            .select(`
                id, 
                teachers(profiles(full_name)),
                courses(name),
                grades(name),
                sections(name)
            `)
            .eq('year_id', selectedYear)
        if (data) setAssignments(data)
    }

    const handleAssign = async () => {
        if (!selectedYear || !selectedTeacher || !selectedCourse || !selectedGrade) {
            alert("Missing fields")
            return
        }
        setLoading(true)
        const { error } = await supabase.from('teacher_assignments').insert({
            year_id: selectedYear,
            teacher_id: selectedTeacher,
            course_id: selectedCourse,
            grade_id: selectedGrade,
            section_id: selectedSection || null
        })

        if (error) alert(error.message)
        else {
            fetchAssignments()
            // Clear some fields
            setSelectedCourse('')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Assignments</h1>

            <div className="flex gap-4 items-center">
                <Label>Academic Year:</Label>
                <select className="border rounded p-1" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                    {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
            </div>

            <Card>
                <CardHeader><CardTitle>New Assignment</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-5 gap-4 items-end">
                    <NativeSelect label="Teacher" value={selectedTeacher} onChange={setSelectedTeacher} options={teachers} />
                    <NativeSelect label="Course" value={selectedCourse} onChange={setSelectedCourse} options={courses} />
                    <NativeSelect label="Grade" value={selectedGrade} onChange={setSelectedGrade} options={grades} />
                    <NativeSelect label="Section" value={selectedSection} onChange={setSelectedSection} options={sections} disabled={!selectedGrade} />
                    <Button onClick={handleAssign} disabled={loading}>Assign</Button>
                </CardContent>
            </Card>

            <div className="border rounded-md bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-3 text-left">Teacher</th>
                            <th className="p-3 text-left">Course</th>
                            <th className="p-3 text-left">Grade</th>
                            <th className="p-3 text-left">Section</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignments.map(a => (
                            <tr key={a.id} className="border-b">
                                <td className="p-3">{a.teachers?.profiles?.full_name}</td>
                                <td className="p-3">{a.courses?.name}</td>
                                <td className="p-3">{a.grades?.name}</td>
                                <td className="p-3">{a.sections?.name || 'All Sections'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
