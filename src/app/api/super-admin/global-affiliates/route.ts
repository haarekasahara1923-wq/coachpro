import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/app/api/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const { error } = requireRole(req, ['SUPER_ADMIN'])
    if (error) return error

    try {
        const affiliates = await prisma.affiliate.findMany({
            include: {
                referrals: true,
                payouts: true,
                subscriptionCommissions: { where: { status: 'PENDING' } },
                marketplaceCommissions: { where: { status: 'PENDING' } }
            },
            orderBy: { createdAt: 'desc' }
        })

        const mappedAffiliates = affiliates.map(a => {
            const pendingSubAmount = a.subscriptionCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
            const pendingMktAmount = a.marketplaceCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)

            return {
                id: a.id,
                name: a.name,
                email: a.email,
                code: a.affiliateCode,
                status: a.status,
                totalReferred: a.referrals.length,
                pendingSubscriptionCommission: pendingSubAmount,
                pendingMarketplaceCommission: pendingMktAmount,
                totalPendingUnaggregated: pendingSubAmount + pendingMktAmount,
                payouts: a.payouts.map(p => ({
                    id: p.id,
                    month: p.month,
                    amount: p.totalPayoutAmount,
                    status: p.payoutStatus
                }))
            }
        })

        const allPayouts = await prisma.affiliatePayout.findMany({
            include: { affiliate: true },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({
            success: true,
            affiliates: mappedAffiliates,
            payouts: allPayouts.map(p => ({
                id: p.id,
                affiliateName: p.affiliate.name,
                month: p.month,
                subCommission: p.totalSubscriptionCommission,
                mktCommission: p.totalMarketplaceCommission,
                totalAmount: p.totalPayoutAmount,
                status: p.payoutStatus,
                date: p.payoutDate,
                tzRef: p.transactionReference
            }))
        })
    } catch (err: any) {
        console.error('Super Admin Global Affiliates API Error:', err)
        return NextResponse.json({ error: 'Internal server error fetching data' }, { status: 500 })
    }
}
