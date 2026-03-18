import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAuth } from '@/app/api/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    try {
        const payments = await prisma.payment.findMany({
            where: { tenantId: user!.tenantId },
            include: { student: { select: { fullName: true } } },
            orderBy: { createdAt: 'desc' }
        })

        const data = payments.map(p => ({
            ...p,
            studentName: p.student.fullName,
        }))

        return NextResponse.json({ success: true, data })
    } catch (err) {
        console.error('Fetch payments error:', err)
        return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    try {
        const body = await req.json()
        const { studentId, feeId, amount, mode, reference, receivedBy, notes } = body

        if (!studentId || !amount) {
            return NextResponse.json({ error: 'Student ID and amount are required' }, { status: 400 })
        }

        // Use a transaction to ensure both payment is created and student's paidFee is updated
        const result = await prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    tenantId: user!.tenantId,
                    studentId,
                    feeId: feeId || null,
                    amount: parseFloat(amount),
                    mode: mode as any || 'CASH',
                    reference: reference || '',
                    receivedBy: receivedBy || '',
                    notes: notes || '',
                }
            })

            await tx.student.update({
                where: { id: studentId },
                data: {
                    paidFee: { increment: parseFloat(amount) }
                }
            })

            return payment
        })

        return NextResponse.json({ success: true, data: result }, { status: 201 })
    } catch (err) {
        console.error('Create payment error:', err)
        return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
    }
}
