'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Payment {
    id: string
    studentName: string
    amount: number
    mode: string
    reference: string
    notes: string
    createdAt: string
    studentId: string
}

interface Student {
    id: string
    fullName: string
    phone: string
    totalFee: number
    paidFee: number
}

const modeColors: Record<string, string> = {
    UPI: '#8b5cf6',
    CASH: '#10b981',
    BANK_TRANSFER: '#06b6d4',
    CHEQUE: '#f59e0b',
    CARD: '#ec4899',
    ONLINE: '#6366f1',
}

export default function PaymentsPage() {
    const { token } = useAuth()
    const [payments, setPayments] = useState<Payment[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [form, setForm] = useState({ studentId: '', amount: '', mode: 'CASH', reference: '', notes: '' })
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState('')

    const fetchData = async () => {
        if (!token) return
        const [p, s] = await Promise.all([
            fetch('/api/payments', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ])
        if (p.success) setPayments(p.data)
        if (s.success) setStudents(s.data)
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [token])

    const totalCollection = payments.reduce((s, p) => s + p.amount, 0)
    const modeBreakdown = ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'ONLINE'].map(mode => ({
        mode, amount: payments.filter(p => p.mode === mode).reduce((s, p) => s + p.amount, 0),
        count: payments.filter(p => p.mode === mode).length,
    })).filter(m => m.count > 0)

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const res = await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(form),
        })
        const data = await res.json()
        setSaving(false)
        if (data.success) {
            setToast('Payment recorded successfully!')
            setShowAdd(false)
            setForm({ studentId: '', amount: '', mode: 'CASH', reference: '', notes: '' })
            fetchData()
            setTimeout(() => setToast(''), 3000)
        }
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">💳 Fee Payments</h1>
                    <p className="page-subtitle">Total collected: {formatCurrency(totalCollection)}</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="btn btn-primary">➕ Record Payment</button>
            </div>

            {toast && <div className="toast toast-success" style={{ position: 'relative', marginBottom: '16px', maxWidth: '100%' }}>✓ {toast}</div>}

            {/* Mode Breakdown */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {modeBreakdown.map(m => (
                    <div key={m.mode} style={{ padding: '12px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', borderLeft: `3px solid ${modeColors[m.mode] || '#6366f1'}` }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: 'white' }}>{formatCurrency(m.amount)}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.mode} • {m.count} txns</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Amount</th>
                                    <th>Mode</th>
                                    <th>Reference</th>
                                    <th>Date</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>{p.studentName.charAt(0)}</div>
                                                <span style={{ fontWeight: '600', fontSize: '14px' }}>{p.studentName}</span>
                                            </div>
                                        </td>
                                        <td><span style={{ fontWeight: '700', color: '#10b981', fontSize: '15px' }}>+{formatCurrency(p.amount)}</span></td>
                                        <td>
                                            <span className="badge" style={{ background: `${modeColors[p.mode] || '#6366f1'}20`, color: modeColors[p.mode] || '#818cf8' }}>{p.mode}</span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.reference || '—'}</td>
                                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(p.createdAt)}</td>
                                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{p.notes || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add Payment Modal */}
            {showAdd && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 style={{ fontWeight: '700' }}>💳 Record Payment</h3>
                            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <form onSubmit={handleAdd}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label className="label">Student *</label>
                                    <select className="input" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required>
                                        <option value="">Select Student</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.fullName} — Due: {formatCurrency(s.totalFee - s.paidFee)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid-cols-2">
                                    <div>
                                        <label className="label">Amount (₹) *</label>
                                        <input className="input" type="number" placeholder="5000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="label">Payment Mode</label>
                                        <select className="input" value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
                                            <option value="CASH">💵 Cash</option>
                                            <option value="UPI">📱 UPI</option>
                                            <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
                                            <option value="CHEQUE">📄 Cheque</option>
                                            <option value="CARD">💳 Card</option>
                                            <option value="ONLINE">🌐 Online</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Reference / Transaction ID</label>
                                    <input className="input" placeholder="UPI123456 / NEFT789012" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Notes</label>
                                    <input className="input" placeholder="Additional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowAdd(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? '⏳ Saving...' : '✅ Record Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
