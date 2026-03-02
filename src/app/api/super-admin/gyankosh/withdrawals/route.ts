import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const list = await prisma.affiliateWithdrawal.findMany({
            include: { tenant: true },
            orderBy: { requestedAt: 'desc' }
        })
        return NextResponse.json(list)
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const { id, status } = await req.json()
        const record = await prisma.affiliateWithdrawal.update({
            where: { id },
            data: {
                status,
                processedAt: status === 'PAID' || status === 'REJECTED' ? new Date() : undefined
            }
        })

        // If rejected, refund available balance
        if (status === 'REJECTED') {
            await prisma.tenant.update({
                where: { id: record.tenantId },
                data: { availableBalance: { increment: record.amount } }
            })
        }

        return NextResponse.json(record)
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
