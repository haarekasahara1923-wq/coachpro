import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireFeature, checkPlanLimit } from '@/app/api/middleware'
import { store, generateId } from '@/lib/store'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    // Feature gate check: User needs Pro/Elite plan for mock tests
    const featureCheck = requireFeature(req, 'mockTests')
    if (featureCheck.error) return featureCheck.error

    const tests = store.mockTests.filter(m => m.tenantId === user!.tenantId)
    const batches = store.batches.filter(b => b.tenantId === user!.tenantId)

    // Include plan limit info in response
    const limitCheck = checkPlanLimit(user!.tenantId, 'maxMockTests', tests.length)

    return NextResponse.json({
        success: true,
        data: tests.map(t => ({
            ...t,
            batchName: batches.find(b => b.id === t.batchId)?.name || 'All',
            questionCount: store.questions.filter(q => q.mockTestId === t.id).length,
        })),
        planInfo: {
            limit: limitCheck.limit,
            used: tests.length,
            currentPlan: limitCheck.currentPlan,
            canAdd: limitCheck.allowed,
        },
    })
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    // Feature gate check
    const featureCheck = requireFeature(req, 'mockTests')
    if (featureCheck.error) return featureCheck.error

    // Limit check
    const currentTests = store.mockTests.filter(m => m.tenantId === user!.tenantId)
    const limitCheck = checkPlanLimit(user!.tenantId, 'maxMockTests', currentTests.length)

    if (!limitCheck.allowed) {
        return NextResponse.json({
            error: limitCheck.message,
            code: 'PLAN_LIMIT_REACHED',
            currentPlan: limitCheck.currentPlan,
            limit: limitCheck.limit,
            used: currentTests.length,
        }, { status: 403 })
    }

    const body = await req.json()
    const test = {
        id: generateId(),
        tenantId: user!.tenantId,
        batchId: body.batchId || undefined,
        title: body.title,
        subject: body.subject || '',
        type: body.type || 'MCQ',
        duration: parseInt(body.duration) || 60,
        totalMarks: parseFloat(body.totalMarks) || 100,
        passingMarks: parseFloat(body.passingMarks) || 40,
        negativeMarks: parseFloat(body.negativeMarks) || 0,
        isPublished: false,
        instructions: body.instructions || '',
        createdAt: new Date(),
    }
    store.mockTests.push(test)
    return NextResponse.json({ success: true, data: test }, { status: 201 })
}
