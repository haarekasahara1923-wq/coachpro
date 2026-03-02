import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/api/middleware'
import { store, generateId } from '@/lib/store'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const { batchId, date } = Object.fromEntries(new URL(req.url).searchParams.entries())
    let records = store.attendances.filter(a => a.tenantId === user!.tenantId)
    if (batchId) records = records.filter(a => a.batchId === batchId)
    if (date) records = records.filter(a => a.date === date)
    const students = store.students.filter(s => s.tenantId === user!.tenantId)
    const enriched = records.map(a => ({
        ...a,
        studentName: students.find(s => s.id === a.studentId)?.fullName || 'Unknown',
    }))
    return NextResponse.json({ success: true, data: enriched })
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const body = await req.json()
    // Bulk attendance
    const records = body.records || [body]
    const created = records.map((r: { studentId: string; batchId: string; date: string; status: string; notes?: string }) => {
        const attendance = {
            id: generateId(),
            tenantId: user!.tenantId,
            studentId: r.studentId,
            batchId: r.batchId,
            date: r.date,
            status: r.status || 'PRESENT',
            markedBy: user!.userId,
            notes: r.notes || '',
            createdAt: new Date(),
        }
        store.attendances.push(attendance)
        return attendance
    })
    return NextResponse.json({ success: true, data: created }, { status: 201 })
}
