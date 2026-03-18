import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAuth } from '@/app/api/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    try {
        const batches = await prisma.batch.findMany({
            where: { tenantId: user!.tenantId, isActive: true },
            include: {
                course: { select: { name: true } },
                _count: { select: { students: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
        const data = batches.map(b => ({
            ...b,
            courseName: b.course.name,
            studentCount: b._count.students,
        }))
        return NextResponse.json({ success: true, data })
    } catch (err) {
        console.error('Fetch batches error:', err)
        return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    try {
        const body = await req.json()
        const batch = await prisma.batch.create({
            data: {
                tenantId: user!.tenantId,
                courseId: body.courseId,
                name: body.name,
                startTime: body.startTime || '',
                endTime: body.endTime || '',
                capacity: parseInt(body.capacity) || 30,
                isActive: true,
            }
        })
        return NextResponse.json({ success: true, data: batch }, { status: 201 })
    } catch (err) {
        console.error('Create batch error:', err)
        return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 })
    }
}
