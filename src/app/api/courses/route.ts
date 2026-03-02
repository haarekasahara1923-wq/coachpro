import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/api/middleware'
import { store, generateId } from '@/lib/store'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const data = store.courses.filter(c => c.tenantId === user!.tenantId)
    return NextResponse.json({ success: true, data })
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const body = await req.json()
    const course = {
        id: generateId(),
        tenantId: user!.tenantId,
        name: body.name,
        description: body.description || '',
        duration: body.duration || '',
        fees: parseFloat(body.fees) || 0,
        subjects: body.subjects || [],
        isActive: true,
        createdAt: new Date(),
    }
    store.courses.push(course)
    return NextResponse.json({ success: true, data: course }, { status: 201 })
}
