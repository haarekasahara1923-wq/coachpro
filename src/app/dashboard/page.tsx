'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface DashboardData {
    overview: {
        totalStudents: number
        activeStudents: number
        newAdmissionsThisMonth: number
        totalRevenue: number
        thisMonthRevenue: number
        totalOutstanding: number
        totalExpenses: number
        netProfit: number
        totalTeachers: number
        totalLeads: number
        totalTests: number
    }
    monthlyRevenue: { month: string; amount: number }[]
    courseDistribution: { name: string; value: number }[]
    leadFunnel: { stage: string; count: number }[]
    recentPayments: { id: string; studentName: string; amount: number; mode: string; createdAt: string }[]
}

const PIE_COLORS = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

const statCards = (data: DashboardData['overview']) => [
    {
        title: 'Total Students',
        value: data.totalStudents,
        sub: `${data.activeStudents} active`,
        icon: '👨‍🎓',
        accent: 'linear-gradient(135deg, #6366f1, #818cf8)',
        change: `+${data.newAdmissionsThisMonth} this month`,
        changeColor: '#10b981',
    },
    {
        title: 'Monthly Revenue',
        value: formatCurrency(data.thisMonthRevenue),
        sub: `Total: ${formatCurrency(data.totalRevenue)}`,
        icon: '💰',
        accent: 'linear-gradient(135deg, #10b981, #059669)',
        change: 'Fee collection',
        changeColor: '#10b981',
    },
    {
        title: 'Outstanding Dues',
        value: formatCurrency(data.totalOutstanding),
        sub: 'Pending collection',
        icon: '⚠️',
        accent: 'linear-gradient(135deg, #f59e0b, #d97706)',
        change: 'Needs attention',
        changeColor: '#f59e0b',
    },
    {
        title: 'Net Profit',
        value: formatCurrency(data.netProfit),
        sub: `Expenses: ${formatCurrency(data.totalExpenses)}`,
        icon: '📈',
        accent: data.netProfit >= 0 ? 'linear-gradient(135deg, #6366f1, #ec4899)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
        change: data.netProfit >= 0 ? 'Profitable ✓' : 'Loss',
        changeColor: data.netProfit >= 0 ? '#10b981' : '#ef4444',
    },
    {
        title: 'Total Teachers',
        value: data.totalTeachers,
        sub: 'Active faculty',
        icon: '👩‍🏫',
        accent: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        change: 'Staff strength',
        changeColor: '#06b6d4',
    },
    {
        title: 'Active Leads',
        value: data.totalLeads,
        sub: 'New inquiries',
        icon: '📈',
        accent: 'linear-gradient(135deg, #ec4899, #db2777)',
        change: 'CRM pipeline',
        changeColor: '#ec4899',
    },
]

export default function DashboardPage() {
    const { token, tenant, user } = useAuth()
    const router = useRouter()
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Redirect Super Admin to their panel immediately
        if (user?.role === 'SUPER_ADMIN') {
            router.replace('/dashboard/super-admin')
            return
        }
        if (!token) return
        fetch('/api/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).then(d => {
            if (d.success) setData(d.data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [token, user, router])

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px', margin: '0 auto 16px' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (!data) return null

    const cards = statCards(data.overview)

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">📊 Dashboard Overview</h1>
                    <p className="page-subtitle">Welcome back! Here's what's happening at {tenant?.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href="/dashboard/students/add" className="btn btn-primary">
                        ➕ Add Student
                    </Link>
                    <Link href="/dashboard/leads" className="btn btn-secondary">
                        📈 View Leads
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {cards.map((card, i) => (
                    <div key={i} className="stat-card" style={{ '--card-accent': card.accent } as React.CSSProperties}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{card.title}</p>
                                <p style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '6px' }}>{card.value}</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{card.sub}</p>
                                <p style={{ fontSize: '12px', color: card.changeColor, marginTop: '8px', fontWeight: '600' }}>{card.change}</p>
                            </div>
                            <div style={{ fontSize: '32px', opacity: 0.9 }}>{card.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* Revenue Chart */}
                <div className="card">
                    <h3 style={{ fontWeight: '700', marginBottom: '20px', fontSize: '16px' }}>📈 Monthly Revenue (Last 6 Months)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(v: any) => `₹${(Number(v) / 1000).toFixed(0)}K`} />
                            <Tooltip
                                contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                                formatter={(v: any) => [formatCurrency(Number(v ?? 0)), 'Revenue']}
                            />
                            <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Course Distribution */}
                <div className="card">
                    <h3 style={{ fontWeight: '700', marginBottom: '20px', fontSize: '16px' }}>🎯 Course Distribution</h3>
                    {data.courseDistribution.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={data.courseDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={(props: any) => `${props.value}`}>
                                        {data.courseDistribution.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                {data.courseDistribution.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block' }} />
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px', color: 'var(--text-muted)', fontSize: '14px' }}>
                            No data yet
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Recent Payments */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontWeight: '700', fontSize: '16px' }}>💳 Recent Payments</h3>
                        <Link href="/dashboard/payments" style={{ fontSize: '13px', color: 'var(--primary-light)', textDecoration: 'none' }}>View all →</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {data.recentPayments.length > 0 ? data.recentPayments.slice(0, 4).map((p) => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--surface-2)', borderRadius: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>{p.studentName.charAt(0)}</div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{p.studentName}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.mode}</div>
                                    </div>
                                </div>
                                <span style={{ fontWeight: '700', color: '#10b981', fontSize: '14px' }}>+{formatCurrency(p.amount)}</span>
                            </div>
                        )) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No payments yet</p>
                        )}
                    </div>
                </div>

                {/* Lead Funnel */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontWeight: '700', fontSize: '16px' }}>🔄 Lead Funnel</h3>
                        <Link href="/dashboard/leads" style={{ fontSize: '13px', color: 'var(--primary-light)', textDecoration: 'none' }}>Manage →</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {data.leadFunnel.map((item, i) => {
                            const max = Math.max(...data.leadFunnel.map(l => l.count), 1)
                            const pct = (item.count / max) * 100
                            const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b']
                            return (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.stage}</span>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>{item.count}</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${pct}%`, background: colors[i] }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Quick actions */}
                    <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <Link href="/dashboard/students/add" className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>
                            ➕ New Student
                        </Link>
                        <Link href="/dashboard/leads" className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }}>
                            📈 Add Lead
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick links */}
            <div style={{ marginTop: '24px', padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                <h3 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>⚡ Quick Actions</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {[
                        { href: '/dashboard/attendance', label: '✅ Mark Attendance', color: '#10b981' },
                        { href: '/dashboard/mock-tests', label: '📝 Create Test', color: '#6366f1' },
                        { href: '/dashboard/ai-tools', label: '🤖 AI Questions', color: '#8b5cf6' },
                        { href: '/dashboard/fees', label: '💰 Collect Fee', color: '#f59e0b' },
                        { href: '/dashboard/whatsapp', label: '💬 Send WhatsApp', color: '#25d366' },
                        { href: '/dashboard/expenses', label: '📉 Add Expense', color: '#ef4444' },
                    ].map(a => (
                        <Link key={a.href} href={a.href} style={{
                            padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                            background: `${a.color}15`, border: `1px solid ${a.color}30`, color: a.color,
                            textDecoration: 'none', transition: 'all 0.2s',
                        }}>
                            {a.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
