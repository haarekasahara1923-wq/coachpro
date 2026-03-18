import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAuth } from '@/app/api/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    try {
        const data = await prisma.course.findMany({
            where: { tenantId: user!.tenantId, isActive: true },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json({ success: true, data })
    } catch (err) {
        console.error('Fetch courses error:', err)
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    try {
        const body = await req.json()
        const course = await prisma.course.create({
            data: {
                tenantId: user!.tenantId,
                name: body.name,
                description: body.description || '',
                duration: body.duration || '',
                fees: parseFloat(body.fees) || 0,
                subjects: body.subjects || [],
                isActive: true,
            }
        })
        return NextResponse.json({ success: true, data: course }, { status: 201 })
    } catch (err) {
        console.error('Create course error:', err)
        return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
    }
}
