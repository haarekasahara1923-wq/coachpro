import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/api/middleware'
import { store, generateId } from '@/lib/store'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const expenses = store.expenses.filter(e => e.tenantId === user!.tenantId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return NextResponse.json({ success: true, data: expenses })
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const body = await req.json()
    const expense = {
        id: generateId(),
        tenantId: user!.tenantId,
        category: body.category,
        amount: parseFloat(body.amount),
        date: body.date,
        description: body.description || '',
        paidTo: body.paidTo || '',
        createdAt: new Date(),
    }
    store.expenses.push(expense)
    return NextResponse.json({ success: true, data: expense }, { status: 201 })
}
