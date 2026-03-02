import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, checkPlanLimit } from '@/app/api/middleware'
import { store, generateId } from '@/lib/store'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    const teachers = store.teachers.filter(t => t.tenantId === user!.tenantId)

    // Include plan limit info in response
    const limitCheck = checkPlanLimit(user!.tenantId, 'maxTeachers', teachers.length)

    return NextResponse.json({
        success: true,
        data: teachers,
        total: teachers.length,
        planInfo: {
            limit: limitCheck.limit,
            used: teachers.length,
            currentPlan: limitCheck.currentPlan,
            canAdd: limitCheck.allowed,
        },
    })
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    // Check plan limit before adding
    const currentTeachers = store.teachers.filter(t => t.tenantId === user!.tenantId)
    const limitCheck = checkPlanLimit(user!.tenantId, 'maxTeachers', currentTeachers.length)

    if (!limitCheck.allowed) {
        return NextResponse.json({
            error: limitCheck.message,
            code: 'PLAN_LIMIT_REACHED',
            currentPlan: limitCheck.currentPlan,
            limit: limitCheck.limit,
            used: currentTeachers.length,
        }, { status: 403 })
    }

    const body = await req.json()
    const teacher = {
        id: generateId(),
        tenantId: user!.tenantId,
        name: body.name,
        email: body.email || '',
        phone: body.phone,
        subject: body.subject || [],
        salary: parseFloat(body.salary) || 0,
        joinDate: body.joinDate || new Date().toISOString().split('T')[0],
        isActive: true,
        createdAt: new Date(),
    }
    store.teachers.push(teacher)

    return NextResponse.json({ success: true, data: teacher }, { status: 201 })
}
