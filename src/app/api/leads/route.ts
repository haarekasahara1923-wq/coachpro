import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireFeature, checkPlanLimit } from '@/app/api/middleware'
import { store, generateId } from '@/lib/store'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    // Feature gate check: User needs Pro/Elite plan for leads
    const featureCheck = requireFeature(req, 'leadManagement')
    if (featureCheck.error) return featureCheck.error

    const leads = store.leads.filter(l => l.tenantId === user!.tenantId)

    // Include plan limit info in response
    const limitCheck = checkPlanLimit(user!.tenantId, 'maxLeads', leads.length)

    return NextResponse.json({
        success: true,
        data: leads,
        planInfo: {
            limit: limitCheck.limit,
            used: leads.length,
            currentPlan: limitCheck.currentPlan,
            canAdd: limitCheck.allowed,
        },
    })
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    // Feature gate check
    const featureCheck = requireFeature(req, 'leadManagement')
    if (featureCheck.error) return featureCheck.error

    // Limit check
    const currentLeads = store.leads.filter(l => l.tenantId === user!.tenantId)
    const limitCheck = checkPlanLimit(user!.tenantId, 'maxLeads', currentLeads.length)

    if (!limitCheck.allowed) {
        return NextResponse.json({
            error: limitCheck.message,
            code: 'PLAN_LIMIT_REACHED',
            currentPlan: limitCheck.currentPlan,
            limit: limitCheck.limit,
            used: currentLeads.length,
        }, { status: 403 })
    }

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

    // Feature gate check
    const featureCheck = requireFeature(req, 'leadManagement')
    if (featureCheck.error) return featureCheck.error

    const body = await req.json()
    const lead = store.leads.find(l => l.id === body.id && l.tenantId === user!.tenantId)
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    Object.assign(lead, { status: body.status, notes: body.notes, followUpDate: body.followUpDate })
    return NextResponse.json({ success: true, data: lead })
}
