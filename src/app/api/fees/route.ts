import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/api/middleware'
import { store, generateId } from '@/lib/store'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const data = store.fees.filter(f => f.tenantId === user!.tenantId)
    const students = store.students.filter(s => s.tenantId === user!.tenantId)
    const enriched = data.map(f => ({
        ...f,
        studentName: students.find(s => s.id === f.studentId)?.fullName || 'Unknown',
        studentPhone: students.find(s => s.id === f.studentId)?.phone || '',
    }))
    return NextResponse.json({ success: true, data: enriched })
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const body = await req.json()
    const fee = {
        id: generateId(),
        tenantId: user!.tenantId,
        studentId: body.studentId,
        amount: parseFloat(body.amount),
        dueDate: body.dueDate,
        status: 'PENDING',
        lateFee: 0,
        notes: body.notes || '',
        createdAt: new Date(),
    }
    store.fees.push(fee)
    return NextResponse.json({ success: true, data: fee }, { status: 201 })
}
