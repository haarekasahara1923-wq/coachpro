import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/api/middleware'
import { store, generateId } from '@/lib/store'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    const tenantId = user!.tenantId
    const today = new Date()
    const thisMonth = today.getMonth()
    const thisYear = today.getFullYear()

    const students = store.students.filter(s => s.tenantId === tenantId)
    const payments = store.payments.filter(p => p.tenantId === tenantId)
    const expenses = store.expenses.filter(e => e.tenantId === tenantId)
    const leads = store.leads.filter(l => l.tenantId === tenantId)
    const teachers = store.teachers.filter(t => t.tenantId === tenantId)
    const mockTests = store.mockTests.filter(m => m.tenantId === tenantId)

    const activeStudents = students.filter(s => s.status === 'ACTIVE').length
    const newAdmissionsThisMonth = students.filter(s => {
        const d = new Date(s.admissionDate)
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    }).length

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
    const thisMonthRevenue = payments.filter(p => {
        const d = new Date(p.createdAt)
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    }).reduce((sum, p) => sum + p.amount, 0)

    const totalOutstanding = students.reduce((sum, s) => sum + (s.totalFee - s.paidFee), 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

    // Monthly revenue for chart
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const month = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1)
        const label = month.toLocaleDateString('en-IN', { month: 'short' })
        const amount = payments.filter(p => {
            const d = new Date(p.createdAt)
            return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear()
        }).reduce((sum, p) => sum + p.amount, 0)
        return { month: label, amount }
    })

    // Course distribution
    const courses = store.courses.filter(c => c.tenantId === tenantId)
    const courseDistribution = courses.map(c => ({
        name: c.name,
        value: students.filter(s => s.courseId === c.id).length,
    })).filter(c => c.value > 0)

    // Lead funnel
    const leadFunnel = [
        { stage: 'New', count: leads.filter(l => l.status === 'NEW').length },
        { stage: 'Contacted', count: leads.filter(l => l.status === 'CONTACTED').length },
        { stage: 'Interested', count: leads.filter(l => l.status === 'INTERESTED').length },
        { stage: 'Converted', count: leads.filter(l => l.status === 'CONVERTED').length },
    ]

    return NextResponse.json({
        success: true,
        data: {
            overview: {
                totalStudents: students.length,
                activeStudents,
                newAdmissionsThisMonth,
                totalRevenue,
                thisMonthRevenue,
                totalOutstanding,
                totalExpenses,
                netProfit: totalRevenue - totalExpenses,
                totalTeachers: teachers.length,
                totalLeads: leads.length,
                totalTests: mockTests.length,
            },
            monthlyRevenue,
            courseDistribution,
            leadFunnel,
            recentPayments: payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map(p => ({
                ...p,
                studentName: students.find(s => s.id === p.studentId)?.fullName || 'Unknown',
            })),
        },
    })
}
