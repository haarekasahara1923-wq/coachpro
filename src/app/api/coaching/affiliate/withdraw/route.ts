import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/auth'



export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded = verifyAccessToken(token)
        if (!decoded?.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { amount } = await req.json()
        if (amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

        // Check balance
        const tenant = await prisma.tenant.findUnique({ where: { id: decoded.tenantId } })
        if (!tenant || tenant.availableBalance < amount) {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
        }

        // Deduct balance
        await prisma.tenant.update({
            where: { id: decoded.tenantId },
            data: { availableBalance: { decrement: amount } }
        })

        // Create withdrawal request
        const withdrawal = await prisma.affiliateWithdrawal.create({
            data: {
                tenantId: decoded.tenantId,
                amount,
                status: 'PENDING'
            }
        })

        return NextResponse.json(withdrawal)
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
