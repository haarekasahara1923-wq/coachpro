import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/api/middleware'
import { store, generateId } from '@/lib/store'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    return NextResponse.json({ success: true, data: store.teachers.filter(t => t.tenantId === user!.tenantId) })
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const body = await req.json()
    const teacher = {
        id: generateId(),
        tenantId: user!.tenantId,
        name: body.name,
        email: body.email || '',
        phone: body.phone,
        subject: body.subject || [],
        salary: parseFloat(body.salary) || 0,
        joinDate: body.joinDate || new Date().toISOString().split('T')[0],
        isActive: true,
        createdAt: new Date(),
    }
    store.teachers.push(teacher)
    return NextResponse.json({ success: true, data: teacher }, { status: 201 })
}
