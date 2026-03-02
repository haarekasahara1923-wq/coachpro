import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/api/middleware'
import { store, generateId } from '@/lib/store'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    return NextResponse.json({ success: true, data: store.leads.filter(l => l.tenantId === user!.tenantId) })
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const body = await req.json()
    const lead = {
        id: generateId(),
        tenantId: user!.tenantId,
        name: body.name,
        phone: body.phone,
        email: body.email || '',
        course: body.course || '',
        source: body.source || '',
        status: 'NEW',
        followUpDate: body.followUpDate || '',
        notes: body.notes || '',
        assignedTo: body.assignedTo || '',
        createdAt: new Date(),
    }
    store.leads.push(lead)
    return NextResponse.json({ success: true, data: lead }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error
    const body = await req.json()
    const lead = store.leads.find(l => l.id === body.id && l.tenantId === user!.tenantId)
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    Object.assign(lead, { status: body.status, notes: body.notes, followUpDate: body.followUpDate })
    return NextResponse.json({ success: true, data: lead })
}
