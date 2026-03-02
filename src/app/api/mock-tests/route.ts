import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/api/middleware'
import { store, generateId } from '@/lib/store'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const tests = store.mockTests.filter(m => m.tenantId === user!.tenantId)
    const batches = store.batches.filter(b => b.tenantId === user!.tenantId)
    return NextResponse.json({
        success: true,
        data: tests.map(t => ({
            ...t,
            batchName: batches.find(b => b.id === t.batchId)?.name || 'All',
            questionCount: store.questions.filter(q => q.mockTestId === t.id).length,
        })),
    })
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
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
