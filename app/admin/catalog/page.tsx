'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Level = { id: string; name: string }
type Grade = { id: string; level_id: string; name: string; levels?: Level }
type Course = { id: string; name: string; active: boolean }

export default function CatalogPage() {
    const [levels, setLevels] = useState<Level[]>([])
    const [grades, setGrades] = useState<Grade[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [newGradeName, setNewGradeName] = useState('')
    const [selectedLevel, setSelectedLevel] = useState<string>('')
    const [newCourseName, setNewCourseName] = useState('')
    const [loading, setLoading] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        fetchCatalog()
    }, [])

    const fetchCatalog = async () => {
        const { data: l } = await supabase.from('levels').select('*').order('name')
        if (l) {
            setLevels(l)
            if (l.length > 0 && !selectedLevel) setSelectedLevel(l[0].id)
        }
        const { data: g } = await supabase.from('grades').select('*, levels(name)').order('name')
        if (g) setGrades(g)
        const { data: c } = await supabase.from('courses').select('*').order('name')
        if (c) setCourses(c)
    }

    const handleCreateGrade = async () => {
        if (!newGradeName || !selectedLevel) return
        setLoading(true)
        const { error } = await supabase.from('grades').insert({ name: newGradeName, level_id: selectedLevel })
        if (!error) {
            setNewGradeName('')
            fetchCatalog()
        } else {
            alert(error.message)
        }
        setLoading(false)
    }

    const handleCreateCourse = async () => {
        if (!newCourseName) return
        setLoading(true)
        const { error } = await supabase.from('courses').insert({ name: newCourseName })
        if (!error) {
            setNewCourseName('')
            fetchCatalog()
        } else {
            alert(error.message)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Catalog Management</h1>

            <div className="grid md:grid-cols-2 gap-6">
                {/* GRADES MANAGEMENT */}
                <Card>
                    <CardHeader><CardTitle>Grades</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2 items-end">
                            <div className="w-1/3">
                                <Label>Level</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                >
                                    {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            <div className="flex-1">
                                <Label>Grade Name</Label>
                                <Input value={newGradeName} onChange={e => setNewGradeName(e.target.value)} placeholder="e.g. 1st Grade" />
                            </div>
                            <Button onClick={handleCreateGrade} disabled={loading}>Add</Button>
                        </div>
                        <div className="border rounded-md max-h-60 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50">
                                        <th className="p-2 text-left">Level</th>
                                        <th className="p-2 text-left">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grades.map(g => (
                                        <tr key={g.id} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="p-2 text-slate-500">
                                                {/* Use local level finding to handle join visualization simply if generic types tricky */}
                                                {levels.find(l => l.id === g.level_id)?.name}
                                            </td>
                                            <td className="p-2 font-medium">{g.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* COURSES MANAGEMENT */}
                <Card>
                    <CardHeader><CardTitle>Courses</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <Label>Course Name</Label>
                                <Input value={newCourseName} onChange={e => setNewCourseName(e.target.value)} placeholder="e.g. Mathematics" />
                            </div>
                            <Button onClick={handleCreateCourse} disabled={loading}>Add</Button>
                        </div>
                        <div className="border rounded-md max-h-60 overflow-y-auto">
                            <ul className="divide-y">
                                {courses.map(c => (
                                    <li key={c.id} className="p-2 text-sm flex justify-between items-center hover:bg-slate-50">
                                        <span>{c.name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${c.active ? 'bg-green-100 text-green-700' : 'bg-slate-100'}`}>
                                            {c.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
