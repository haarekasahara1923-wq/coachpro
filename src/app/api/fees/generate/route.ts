import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAuth } from '@/app/api/middleware'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    try {
        const body = await req.json()
        const { studentId, userCustomInstallments } = body
        if (!studentId) return NextResponse.json({ error: 'Student ID missing' }, { status: 400 })

        // Check if there are already installments
        const existingFees = await prisma.fee.count({
            where: { studentId, tenantId: user!.tenantId }
        })

        if (existingFees > 0) {
            return NextResponse.json({ error: 'Installments already exist for this student' }, { status: 400 })
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId, tenantId: user!.tenantId },
            include: { course: true }
        })

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }

        const installmentsToCreate = userCustomInstallments || student.course.installmentCount || 1

        if (student.totalFee <= 0) {
            return NextResponse.json({ error: 'Student has NO total fee set to generate installments securely.' }, { status: 400 })
        }

        const amountPerMonth = Math.round(student.totalFee / installmentsToCreate)
        const feesToCreate: Array<{
            tenantId: string;
            studentId: string;
            amount: number;
            dueDate: Date;
            status: 'PENDING' | 'PAID' | 'PARTIAL';
            lateFee: number;
            notes: string;
            paidDate?: Date;
        }> = []

        for (let i = 0; i < installmentsToCreate; i++) {
            let dueDate = student.admissionDate ? new Date(student.admissionDate) : new Date()
            dueDate.setMonth(dueDate.getMonth() + i)

            // If it's the last iteration, make sure any rounding errors run off
            let feeAmount = amountPerMonth;
            if (i === installmentsToCreate - 1) {
                feeAmount = student.totalFee - (amountPerMonth * (installmentsToCreate - 1));
            }

            // Create fee logic. However, what if they've paid some amounts casually earlier?
            // The user explicitly wants installments mapped against total outstanding or total initial fees.
            // If they have paidFee > 0, we can either automatically mark older installments PAID
            // Or just build the initial tracker. Building the tracker is standard. Let's do that!
            
            feesToCreate.push({
                tenantId: user!.tenantId,
                studentId: student.id,
                amount: feeAmount,
                dueDate: dueDate,
                status: 'PENDING',
                lateFee: 0,
                notes: `Installment ${i + 1} of ${installmentsToCreate}`,
            })
        }

        // Apply any older casually paid amounts to these new installments chronologically
        let remainingPaidBalance = student.paidFee;

        for (const f of feesToCreate) {
            if (remainingPaidBalance >= f.amount) {
                f.status = 'PAID';
                f.paidDate = new Date(); // Mock paid date
                remainingPaidBalance -= f.amount;
            } else if (remainingPaidBalance > 0) {
                f.status = 'PARTIAL';
                remainingPaidBalance = 0; // consumed
            }
        }

        await prisma.fee.createMany({
            data: feesToCreate
        })

        const data = await prisma.fee.findMany({
            where: { studentId: student.id },
            orderBy: { dueDate: 'asc' }
        })

        return NextResponse.json({ success: true, data })

    } catch (err) {
        console.error('Generate fees error:', err)
        return NextResponse.json({ error: 'Failed to generate fees' }, { status: 500 })
    }
}
