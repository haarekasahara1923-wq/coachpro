'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

const mockTenants = [
    { id: 't1', name: 'Sharma Coaching Classes', plan: 'PRO', students: 6, revenue: 156000, status: 'ACTIVE', location: 'Delhi' },
    { id: 't2', name: 'IIT Pathshala', plan: 'ELITE', students: 245, revenue: 1245000, status: 'ACTIVE', location: 'Kota' },
    { id: 't3', name: 'Success Academy', plan: 'BASIC', students: 45, revenue: 125000, status: 'ACTIVE', location: 'Mumbai' },
    { id: 't4', name: 'Brilliant Tutorials', plan: 'PRO', students: 125, revenue: 487000, status: 'TRIAL', location: 'Bangalore' },
    { id: 't5', name: 'Career Point', plan: 'ELITE', students: 389, revenue: 2150000, status: 'ACTIVE', location: 'Jaipur' },
]

export default function SuperAdminPage() {
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (user && user.role !== 'SUPER_ADMIN') {
            router.push('/dashboard')
        }
    }, [user, router])

    if (!user || user.role !== 'SUPER_ADMIN') return null

    const totalRevenue = mockTenants.reduce((s, t) => s + (t.plan === 'BASIC' ? 999 : t.plan === 'PRO' ? 2999 : 5999), 0)
    const totalStudents = mockTenants.reduce((s, t) => s + t.students, 0)

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">👑 Super Admin Panel</h1>
                    <p className="page-subtitle">Platform overview — CoachPro SaaS</p>
                </div>
                <div style={{ padding: '8px 16px', background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '10px', color: '#f9a8d4', fontSize: '13px', fontWeight: '700' }}>
                    🔴 Super Admin Mode
                </div>
            </div>

            {/* Platform Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Coaching Centers', value: mockTenants.length, icon: '🏫', color: '#6366f1' },
                    { label: 'Total Students', value: totalStudents.toLocaleString('en-IN'), icon: '👨‍🎓', color: '#10b981' },
                    { label: 'Monthly SaaS Revenue', value: formatCurrency(totalRevenue), icon: '💎', color: '#f59e0b' },
                    { label: 'Active Subscriptions', value: mockTenants.filter(t => t.status === 'ACTIVE').length, icon: '✅', color: '#ec4899' },
                ].map(s => (
                    <div key={s.label} className="stat-card" style={{ '--card-accent': s.color } as React.CSSProperties}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</p>
                                <p style={{ fontSize: '26px', fontWeight: '800', color: 'white' }}>{s.value}</p>
                            </div>
                            <div style={{ fontSize: '32px' }}>{s.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Plan Distribution */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                    { plan: 'BASIC', count: mockTenants.filter(t => t.plan === 'BASIC').length, color: '#6366f1', price: '₹999/mo' },
                    { plan: 'PRO', count: mockTenants.filter(t => t.plan === 'PRO').length, color: '#ec4899', price: '₹2,999/mo' },
                    { plan: 'ELITE', count: mockTenants.filter(t => t.plan === 'ELITE').length, color: '#f59e0b', price: '₹5,999/mo' },
                    { plan: 'TRIAL', count: mockTenants.filter(t => t.status === 'TRIAL').length, color: '#06b6d4', price: 'Free' },
                ].map(p => (
                    <div key={p.plan} style={{ padding: '16px 24px', background: 'var(--surface)', border: `1px solid ${p.color}30`, borderRadius: '12px', borderLeft: `4px solid ${p.color}`, minWidth: '140px' }}>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: p.color }}>{p.count}</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '2px' }}>{p.plan}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.price}</div>
                    </div>
                ))}
            </div>

            {/* Tenants Table */}
            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontWeight: '700', fontSize: '16px' }}>🏫 All Coaching Centers</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input className="input" placeholder="Search..." style={{ width: '200px', padding: '8px 12px' }} />
                    </div>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Coaching Center</th>
                                <th>Location</th>
                                <th>Plan</th>
                                <th>Students</th>
                                <th>Revenue</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockTenants.map(t => {
                                const planColors: Record<string, string> = { BASIC: '#6366f1', PRO: '#ec4899', ELITE: '#f59e0b' }
                                const pc = planColors[t.plan] || '#6366f1'
                                return (
                                    <tr key={t.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '14px' }}>{t.name.charAt(0)}</div>
                                                <div style={{ fontWeight: '600', fontSize: '14px' }}>{t.name}</div>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>📍 {t.location}</td>
                                        <td>
                                            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: `${pc}20`, color: pc }}>{t.plan}</span>
                                        </td>
                                        <td style={{ fontWeight: '600' }}>{t.students}</td>
                                        <td style={{ fontWeight: '700', color: '#10b981' }}>{formatCurrency(t.revenue)}</td>
                                        <td>
                                            <span className={`badge ${t.status === 'ACTIVE' ? 'badge-success' : 'badge-info'}`}>{t.status}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="btn btn-secondary btn-sm">👁️ View</button>
                                                <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>⛔ Suspend</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
