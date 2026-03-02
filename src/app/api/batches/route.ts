import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/api/middleware'
import { store, generateId } from '@/lib/store'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const batches = store.batches.filter(b => b.tenantId === user!.tenantId)
    const courses = store.courses.filter(c => c.tenantId === user!.tenantId)
    const enriched = batches.map(b => ({
        ...b,
        courseName: courses.find(c => c.id === b.courseId)?.name || 'N/A',
        studentCount: store.students.filter(s => s.batchId === b.id).length,
    }))
    return NextResponse.json({ success: true, data: enriched })
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const body = await req.json()
    const batch = {
        id: generateId(),
        tenantId: user!.tenantId,
        courseId: body.courseId,
        name: body.name,
        startTime: body.startTime || '',
        endTime: body.endTime || '',
        capacity: parseInt(body.capacity) || 30,
        isActive: true,
        createdAt: new Date(),
    }
    store.batches.push(batch)
    return NextResponse.json({ success: true, data: batch }, { status: 201 })
}
