'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Papa from 'papaparse'

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchStudents()
    }, [])

    const fetchStudents = async () => {
        const { data } = await supabase.from('students').select(`
        *, 
        grades (name, levels (name)), 
        sections (name)
    `).order('created_at', { ascending: false }).limit(50)
        if (data) setStudents(data)
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const rows = results.data as any[]
                console.log('Processing', rows.length, 'students')

                // 1. Fetch Catalog
                const { data: levels } = await supabase.from('levels').select('*')
                const { data: grades } = await supabase.from('grades').select('*')
                const { data: sections } = await supabase.from('sections').select('*')

                // Helpers
                const getLevelId = (name: string) => levels?.find(l => l.name === name)?.id
                const getGradeId = (name: string, levelId: string) => grades?.find(g => g.name === name && g.level_id === levelId)?.id
                const getSectionId = (name: string, gradeId: string) => sections?.find(s => s.name === name && s.grade_id === gradeId)?.id

                let successCount = 0

                for (const row of rows) {
                    // Required: first_names, last_names, level, grade
                    if (!row.first_names || !row.last_names || !row.level || !row.grade) continue

                    // Level
                    let levelId = getLevelId(row.level)
                    if (!levelId) continue // For MVP, strictly require valid level (Inicial/Primaria/Secundaria)

                    // Grade
                    let gradeId = getGradeId(row.grade, levelId)
                    if (!gradeId) {
                        // Create Grade
                        const { data: newGrade } = await supabase.from('grades').insert({ name: row.grade, level_id: levelId }).select().single()
                        if (newGrade) {
                            gradeId = newGrade.id
                            grades?.push(newGrade) // Update local cache
                        } else continue
                    }

                    // Section (Optional)
                    let sectionId = null
                    if (row.section) {
                        sectionId = getSectionId(row.section, gradeId!)
                        if (!sectionId) {
                            const { data: newSection } = await supabase.from('sections').insert({ name: row.section, grade_id: gradeId! }).select().single()
                            if (newSection) {
                                sectionId = newSection.id
                                sections?.push(newSection)
                            }
                        }
                    }

                    // Insert Student
                    const { error } = await supabase.from('students').upsert({
                        first_names: row.first_names,
                        last_names: row.last_names,
                        dni: row.dni || null,
                        student_code: row.student_code || null,
                        grade_id: gradeId!,
                        section_id: sectionId
                    }, { onConflict: 'dni' }) // Assuming DNI is unique key if present

                    if (!error) successCount++
                }

                alert(`Processed ${rows.length}. Success: ${successCount}`)
                setLoading(false)
                fetchStudents()
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Students</h1>
                <div className="flex items-center gap-2">
                    <Label className="bg-slate-900 text-white px-4 py-2 rounded cursor-pointer">
                        Import CSV
                        <Input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
                    </Label>
                </div>
            </div>

            <div className="border rounded-md">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">DNI</th>
                            <th className="p-3 text-left">Level</th>
                            <th className="p-3 text-left">Grade</th>
                            <th className="p-3 text-left">Section</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(s => (
                            <tr key={s.id} className="border-b hover:bg-slate-50">
                                <td className="p-3 font-medium">{s.last_names}, {s.first_names}</td>
                                <td className="p-3 text-slate-500">{s.dni || '-'}</td>
                                <td className="p-3">{s.grades?.levels?.name}</td>
                                <td className="p-3">{s.grades?.name}</td>
                                <td className="p-3">{s.sections?.name || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
