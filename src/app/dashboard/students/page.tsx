'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Student {
    id: string
    studentId: string
    fullName: string
    phone: string
    email: string
    gender: string
    courseName: string
    batchName: string
    totalFee: number
    paidFee: number
    status: string
    admissionDate: string
    fatherName: string
    parentPhone: string
}

const statusColors: Record<string, string> = {
    ACTIVE: 'badge-success',
    INACTIVE: 'badge-gray',
    DROPOUT: 'badge-danger',
    PASSED: 'badge-info',
}

export default function StudentsPage() {
    const { token } = useAuth()
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

    const fetchStudents = async () => {
        if (!token) return
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        const res = await fetch(`/api/students?${params}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (data.success) setStudents(data.data)
        setLoading(false)
    }

    useEffect(() => { fetchStudents() }, [token, search])

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">👨‍🎓 Students</h1>
                    <p className="page-subtitle">{students.length} students registered</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link href="/dashboard/students/add" className="btn btn-primary">➕ Add Student</Link>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <input
                            className="input"
                            placeholder="🔍 Search by name, phone, or student ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-secondary" onClick={fetchStudents}>🔄 Refresh</button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                    { label: 'Total', value: students.length, color: '#6366f1' },
                    { label: 'Active', value: students.filter(s => s.status === 'ACTIVE').length, color: '#10b981' },
                    { label: 'Dropout', value: students.filter(s => s.status === 'DROPOUT').length, color: '#ef4444' },
                    { label: 'With Dues', value: students.filter(s => s.totalFee > s.paidFee).length, color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} style={{ padding: '14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <div className="spinner" style={{ margin: '0 auto 12px', width: '32px', height: '32px' }} />
                            <p style={{ color: 'var(--text-muted)' }}>Loading students...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🎓</div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '16px' }}>No students found</p>
                            <Link href="/dashboard/students/add" className="btn btn-primary">Add First Student</Link>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Course / Batch</th>
                                    <th>Phone</th>
                                    <th>Fee Status</th>
                                    <th>Status</th>
                                    <th>Admission</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => {
                                    const owing = s.totalFee - s.paidFee
                                    const pct = s.totalFee > 0 ? Math.round((s.paidFee / s.totalFee) * 100) : 0
                                    return (
                                        <tr key={s.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div className="avatar">
                                                        {s.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{s.fullName}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.studentId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '13px', fontWeight: '600' }}>{s.courseName}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.batchName}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '13px' }}>{s.phone}</div>
                                                {s.parentPhone && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>P: {s.parentPhone}</div>}
                                            </td>
                                            <td>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <div className="progress-bar" style={{ height: '4px' }}>
                                                        <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 100 ? '#10b981' : pct > 50 ? '#f59e0b' : '#ef4444' }} />
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '11px', color: owing > 0 ? '#f59e0b' : '#10b981', fontWeight: '600' }}>
                                                    {pct}% paid {owing > 0 ? `• Due: ${formatCurrency(owing)}` : '✓'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${statusColors[s.status] || 'badge-gray'}`}>{s.status}</span>
                                            </td>
                                            <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                                {s.admissionDate ? formatDate(s.admissionDate) : '-'}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button onClick={() => setSelectedStudent(s)} className="btn btn-secondary btn-sm">👁️</button>
                                                    <a href={`https://wa.me/${s.parentPhone?.replace(/\D/g, '') || s.phone?.replace(/\D/g, '')}`} target="_blank" className="btn btn-sm" style={{ background: '#25d366', color: 'white', textDecoration: 'none' }}>💬</a>
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

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '20px' }}>{selectedStudent.fullName.charAt(0)}</div>
                                <div>
                                    <h3 style={{ fontWeight: '700', fontSize: '18px' }}>{selectedStudent.fullName}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{selectedStudent.studentId}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="grid-cols-2">
                                {[
                                    ['📱 Phone', selectedStudent.phone],
                                    ['👨 Father', selectedStudent.fatherName || 'N/A'],
                                    ['📧 Email', selectedStudent.email || 'N/A'],
                                    ['📞 Parent Phone', selectedStudent.parentPhone || 'N/A'],
                                    ['📚 Course', selectedStudent.courseName],
                                    ['🕐 Batch', selectedStudent.batchName],
                                    ['💰 Total Fee', formatCurrency(selectedStudent.totalFee)],
                                    ['✅ Paid', formatCurrency(selectedStudent.paidFee)],
                                    ['⚠️ Pending', formatCurrency(selectedStudent.totalFee - selectedStudent.paidFee)],
                                    ['📅 Admission', selectedStudent.admissionDate ? formatDate(selectedStudent.admissionDate) : 'N/A'],
                                ].map(([label, value]) => (
                                    <div key={label} style={{ padding: '10px', background: 'var(--surface-2)', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <a href={`https://wa.me/${(selectedStudent.parentPhone || selectedStudent.phone)?.replace(/\D/g, '')}?text=Dear Parent, This is regarding ${selectedStudent.fullName} from our coaching institute.`} target="_blank" className="btn btn-success">💬 WhatsApp Parent</a>
                            <button onClick={() => setSelectedStudent(null)} className="btn btn-secondary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
