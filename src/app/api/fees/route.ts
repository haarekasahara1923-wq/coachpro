import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAuth } from '@/app/api/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    try {
        const fees = await prisma.fee.findMany({
            where: { tenantId: user!.tenantId },
            include: { student: { select: { fullName: true, phone: true } } },
            orderBy: { dueDate: 'asc' }
        })

        const data = fees.map(f => ({
            ...f,
            studentName: f.student.fullName,
            studentPhone: f.student.phone,
        }))

        return NextResponse.json({ success: true, data })
    } catch (err) {
        console.error('Fetch fees error:', err)
        return NextResponse.json({ error: 'Failed to fetch fees' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    try {
        const body = await req.json()
        const { studentId, amount, dueDate, notes } = body

        if (!studentId || !amount || !dueDate) {
            return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
        }

        const fee = await prisma.fee.create({
            data: {
                tenantId: user!.tenantId,
                studentId,
                amount: parseFloat(amount),
                dueDate: new Date(dueDate),
                status: 'PENDING',
                lateFee: 0,
                notes: notes || '',
            }
        })
        return NextResponse.json({ success: true, data: fee }, { status: 201 })
    } catch (err) {
        console.error('Create fee error:', err)
        return NextResponse.json({ error: 'Failed to create fee' }, { status: 500 })
    }
}
