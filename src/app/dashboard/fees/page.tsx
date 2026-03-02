'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'

interface Student {
    id: string
    fullName: string
    phone: string
    parentPhone: string
    courseName: string
    totalFee: number
    paidFee: number
    status: string
}

export default function FeesPage() {
    const { token } = useAuth()
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('outstanding')
    const [toast, setToast] = useState('')

    useEffect(() => {
        if (!token) return
        fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => { if (data.success) setStudents(data.data); setLoading(false) })
    }, [token])

    const outstanding = students.filter(s => s.totalFee > s.paidFee).sort((a, b) => (b.totalFee - b.paidFee) - (a.totalFee - a.paidFee))
    const paid = students.filter(s => s.paidFee >= s.totalFee)
    const totalDue = outstanding.reduce((s, st) => s + (st.totalFee - st.paidFee), 0)
    const totalCollected = students.reduce((s, st) => s + st.paidFee, 0)

    const sendWhatsAppReminder = (student: Student) => {
        const due = formatCurrency(student.totalFee - student.paidFee)
        const msg = `Dear Parent, This is a gentle reminder that ${student.fullName}'s fee of ${due} is pending at our coaching institute. Please arrange payment at your earliest convenience. Thank you!`
        window.open(`https://wa.me/91${(student.parentPhone || student.phone).replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">💰 Fee Management</h1>
                    <p className="page-subtitle">Track and manage student fees</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Collected', value: formatCurrency(totalCollected), icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                    { label: 'Total Outstanding', value: formatCurrency(totalDue), icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                    { label: 'Students with Dues', value: outstanding.length, icon: '👥', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                    { label: 'Fully Paid Students', value: paid.length, icon: '🎉', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
                ].map(c => (
                    <div key={c.label} style={{ padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', borderLeft: `4px solid ${c.color}` }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>{c.icon}</div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: c.color, marginBottom: '4px' }}>{c.value}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{c.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'outstanding' ? 'active' : ''}`} onClick={() => setActiveTab('outstanding')}>⚠️ Outstanding ({outstanding.length})</button>
                <button className={`tab ${activeTab === 'paid' ? 'active' : ''}`} onClick={() => setActiveTab('paid')}>✅ Paid ({paid.length})</button>
                <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>👥 All Students</button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Course</th>
                                    <th>Total Fee</th>
                                    <th>Paid</th>
                                    <th>Pending</th>
                                    <th>Payment %</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(activeTab === 'outstanding' ? outstanding : activeTab === 'paid' ? paid : students).map(s => {
                                    const pending = s.totalFee - s.paidFee
                                    const pct = s.totalFee > 0 ? Math.round((s.paidFee / s.totalFee) * 100) : 0
                                    return (
                                        <tr key={s.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>{s.fullName.charAt(0)}</div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{s.fullName}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.courseName}</td>
                                            <td style={{ fontWeight: '600', fontSize: '14px' }}>{formatCurrency(s.totalFee)}</td>
                                            <td style={{ color: '#10b981', fontWeight: '700' }}>{formatCurrency(s.paidFee)}</td>
                                            <td style={{ color: pending > 0 ? '#ef4444' : '#10b981', fontWeight: '700' }}>
                                                {pending > 0 ? formatCurrency(pending) : '✅ Clear'}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div className="progress-bar" style={{ flex: 1 }}>
                                                        <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 100 ? '#10b981' : pct > 50 ? '#f59e0b' : '#ef4444' }} />
                                                    </div>
                                                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', minWidth: '32px' }}>{pct}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    {pending > 0 && (
                                                        <button onClick={() => sendWhatsAppReminder(s)} style={{ padding: '5px 10px', background: '#25d36615', border: '1px solid #25d36640', borderRadius: '6px', color: '#25d366', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>
                                                            💬 Remind
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
