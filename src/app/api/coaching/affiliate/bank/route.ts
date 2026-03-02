import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded = verifyAccessToken(token)
        if (!decoded?.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { upiId, bankAccountNo, ifscCode } = await req.json()

        await prisma.tenant.update({
            where: { id: decoded.tenantId },
            data: { upiId, bankAccountNo, ifscCode }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
