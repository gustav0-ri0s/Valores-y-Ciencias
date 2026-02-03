'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Year = { id: string; name: string; status: 'open' | 'closed'; created_at: string }
type Bimester = { id: string; number: number; status: 'open_fill' | 'closed' }

export default function AdminDashboard() {
    const [years, setYears] = useState<Year[]>([])
    const [bimesters, setBimesters] = useState<Bimester[]>([])
    const [selectedYear, setSelectedYear] = useState<string | null>(null)
    const [newYearName, setNewYearName] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchYears()
    }, [])

    useEffect(() => {
        if (selectedYear) {
            fetchBimesters(selectedYear)
        } else if (years.length > 0) {
            // Auto select first open year
            const open = years.find(y => y.status === 'open')
            if (open) setSelectedYear(open.id)
            else setSelectedYear(years[0].id)
        }
    }, [years, selectedYear]) // Careful with dependency loop

    const fetchYears = async () => {
        const { data } = await supabase.from('academic_years').select('*').order('created_at', { ascending: false })
        if (data) setYears(data)
    }

    const fetchBimesters = async (yearId: string) => {
        const { data } = await supabase.from('bimesters').select('*').eq('year_id', yearId).order('number')
        if (data) setBimesters(data)
    }

    const handleCreateYear = async () => {
        if (!newYearName.trim()) return
        setLoading(true)
        const { error } = await supabase.from('academic_years').insert({ name: newYearName, status: 'open' })
        if (!error) {
            setNewYearName('')
            fetchYears()
        } else {
            alert('Error creating year: ' + error.message)
        }
        setLoading(false)
    }

    const toggleBimesterStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'open_fill' ? 'closed' : 'open_fill'
        // Optimistic update
        setBimesters(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))

        const { error } = await supabase.from('bimesters').update({ status: newStatus }).eq('id', id)
        if (error) {
            alert('Error updating bimester')
            fetchBimesters(selectedYear!) // Revert
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Academic Year Management</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Create Year Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Year</CardTitle>
                        <CardDescription>Start a new academic cycle</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g. 2026"
                                value={newYearName}
                                onChange={e => setNewYearName(e.target.value)}
                            />
                            <Button onClick={handleCreateYear} disabled={loading}>Create</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Year Selector / Status */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Active Year</CardTitle>
                        <CardDescription>Manage open/close status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 flex-wrap">
                            {years.map(y => (
                                <Button
                                    key={y.id}
                                    variant={selectedYear === y.id ? 'default' : 'outline'}
                                    onClick={() => setSelectedYear(y.id)}
                                    className={y.status === 'closed' ? 'opacity-50' : ''}
                                >
                                    {y.name} {y.status === 'closed' && '(Closed)'}
                                </Button>
                            ))}
                            {years.length === 0 && <span className="text-sm text-slate-500">No years found. Create one.</span>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {selectedYear && (
                <Card>
                    <CardHeader>
                        <CardTitle>Bimesters</CardTitle>
                        <CardDescription>Control filling periods. "Closed" blocks teacher inputs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {bimesters.map(b => (
                                <div key={b.id} className="border rounded-lg p-4 flex flex-col items-center justify-between gap-4">
                                    <span className="font-bold text-lg">Bimester {b.number}</span>
                                    <div className={`px-2 py-1 rounded text-xs font-semibold ${b.status === 'open_fill' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {b.status === 'open_fill' ? 'OPEN FOR FILLING' : 'CLOSED'}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={b.status === 'open_fill' ? 'destructive' : 'default'}
                                        onClick={() => toggleBimesterStatus(b.id, b.status)}
                                    >
                                        {b.status === 'open_fill' ? 'Close Input' : 'Open Input'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
