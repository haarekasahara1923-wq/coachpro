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

        const { plan, cost } = await req.json()
        if (!plan || !cost || cost <= 0) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

        const tenant = await prisma.tenant.findUnique({
            where: { id: decoded.tenantId },
            include: { subscriptions: true }
        })

        if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

        if (tenant.availableBalance < cost) {
            return NextResponse.json({ error: 'Insufficient affiliate balance' }, { status: 400 })
        }

        const currentSub = tenant.subscriptions[0]

        // Deduct balance
        await prisma.tenant.update({
            where: { id: decoded.tenantId },
            data: { availableBalance: { decrement: cost } }
        })

        // Update Subscription
        const start = new Date()
        const end = new Date()
        end.setMonth(end.getMonth() + 1)

        if (currentSub) {
            await prisma.subscription.update({
                where: { id: currentSub.id },
                data: {
                    plan,
                    status: 'ACTIVE',
                    amount: cost,
                    currentPeriodStart: start,
                    currentPeriodEnd: end,
                }
            })
        } else {
            await prisma.subscription.create({
                data: {
                    tenantId: decoded.tenantId,
                    plan,
                    status: 'ACTIVE',
                    amount: cost,
                    currentPeriodStart: start,
                    currentPeriodEnd: end,
                }
            })
        }

        // Log this action as a special withdrawal/payment
        await prisma.affiliateWithdrawal.create({
            data: {
                tenantId: decoded.tenantId,
                amount: cost,
                status: 'PAID',
                notes: `Paid for ${plan} plan subscription`
            }
        })

        return NextResponse.json({ success: true, message: 'Subscription updated successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
