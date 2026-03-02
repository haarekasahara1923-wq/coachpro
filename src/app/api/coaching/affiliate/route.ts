import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/auth'



async function getTenantId() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null
    try {
        const decoded = verifyAccessToken(token)
        return decoded?.tenantId
    } catch {
        return null
    }
}

export async function GET() {
    try {
        const tenantId = await getTenantId()
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const [details, withdrawals] = await Promise.all([
            prisma.tenant.findUnique({ where: { id: tenantId } }),
            prisma.affiliateWithdrawal.findMany({ where: { tenantId }, orderBy: { requestedAt: 'desc' } })
        ])

        return NextResponse.json({ details, withdrawals })
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
