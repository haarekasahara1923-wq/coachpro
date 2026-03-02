import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/api/middleware'
import { store, generateId } from '@/lib/store'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const payments = store.payments.filter(p => p.tenantId === user!.tenantId)
    const students = store.students.filter(s => s.tenantId === user!.tenantId)
    const enriched = payments.map(p => ({
        ...p,
        studentName: students.find(s => s.id === p.studentId)?.fullName || 'Unknown',
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return NextResponse.json({ success: true, data: enriched })
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const body = await req.json()
    const payment = {
        id: generateId(),
        tenantId: user!.tenantId,
        studentId: body.studentId,
        feeId: body.feeId || undefined,
        amount: parseFloat(body.amount),
        mode: body.mode || 'CASH',
        reference: body.reference || '',
        receivedBy: body.receivedBy || '',
        notes: body.notes || '',
        createdAt: new Date(),
    }
    store.payments.push(payment)
    // update student paid fee
    const student = store.students.find(s => s.id === body.studentId)
    if (student) student.paidFee += payment.amount
    return NextResponse.json({ success: true, data: payment }, { status: 201 })
}
