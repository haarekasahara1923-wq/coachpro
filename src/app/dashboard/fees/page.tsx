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

    // Installments Modal State
    const [selectedStudentForFees, setSelectedStudentForFees] = useState<Student | null>(null)
    const [studentFees, setStudentFees] = useState<any[]>([])
    const [feesLoading, setFeesLoading] = useState(false)
    const [paymentMode, setPaymentMode] = useState('CASH')
    const [processingPayment, setProcessingPayment] = useState<string | null>(null)

    const fetchStudents = () => {
        fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => { if (data.success) setStudents(data.data); setLoading(false) })
    }

    useEffect(() => {
        if (!token) return
        fetchStudents()
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

    const openInstallments = async (student: Student) => {
        setSelectedStudentForFees(student)
        setFeesLoading(true)
        const res = await fetch(`/api/fees?studentId=${student.id}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (data.success) {
            setStudentFees(data.data)
        }
        setFeesLoading(false)
    }

    const handlePayInstallment = async (fee: any) => {
        if (!confirm(`Mark ${formatCurrency(fee.amount)} as PAID via ${paymentMode}?`)) return
        setProcessingPayment(fee.id)
        
        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    studentId: fee.studentId,
                    feeId: fee.id,
                    amount: fee.amount,
                    mode: paymentMode,
                    notes: `Installment Payment (${fee.notes || 'Monthly'})`,
                })
            })
            const data = await res.json()
            if (data.success) {
                setToast('Installment marked as paid!')
                setTimeout(() => setToast(''), 3000)
                // Refresh modal data
                openInstallments(selectedStudentForFees!)
                // Refresh main list
                fetchStudents()
            } else {
                alert(data.error || 'Payment failed')
            }
        } catch (err) {
            alert('Error processing payment')
        }
        setProcessingPayment(null)
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
                                                    <button onClick={() => openInstallments(s)} className="btn btn-primary btn-sm" title="View Installments" style={{ padding: '5px 10px', fontSize: '11px', fontWeight: '700' }}>
                                                        📜 Installments
                                                    </button>
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

            {/* Installments Modal */}
            {selectedStudentForFees && (
                <div className="modal-overlay" onClick={() => setSelectedStudentForFees(null)}>
                    <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 style={{ fontWeight: '700', fontSize: '18px' }}>📜 Fee Installments</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{selectedStudentForFees.fullName} • {selectedStudentForFees.courseName}</p>
                            </div>
                            <button onClick={() => setSelectedStudentForFees(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div className="modal-body">
                            {feesLoading ? (
                                <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                            ) : studentFees.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No installments found for this student.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Payment Mode:</label>
                                        <select className="input" style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }} value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                                            <option value="CASH">CASH</option>
                                            <option value="UPI">UPI</option>
                                            <option value="BANK_TRANSFER">BANK TRANSFER</option>
                                            <option value="CARD">CARD</option>
                                        </select>
                                    </div>

                                    {studentFees.map(fee => (
                                        <div key={fee.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--surface-2)', borderRadius: '8px', borderLeft: `4px solid ${fee.status === 'PAID' ? '#10b981' : fee.status === 'PARTIAL' ? '#f59e0b' : '#ef4444'}` }}>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '15px' }}>{formatCurrency(fee.amount)}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{fee.notes || 'Installment'}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Due: {new Date(fee.dueDate).toLocaleDateString()}</div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                                <span className={`badge ${fee.status === 'PAID' ? 'badge-success' : fee.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'}`}>{fee.status}</span>
                                                {fee.status !== 'PAID' && (
                                                    <button 
                                                        className="btn btn-primary btn-sm" 
                                                        style={{ padding: '4px 12px', fontSize: '11px' }}
                                                        onClick={() => handlePayInstallment(fee)}
                                                        disabled={processingPayment === fee.id}
                                                    >
                                                        {processingPayment === fee.id ? '⏳ Processing...' : '💵 Mark Paid'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
