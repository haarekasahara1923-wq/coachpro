'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function CoursesPage() {
    const { token } = useAuth()
    const [courses, setCourses] = useState<{ id: string; name: string; description: string; duration: string; fees: number; subjects: string[]; installmentCount: number; isActive: boolean }[]>([])
    const [batches, setBatches] = useState<{ id: string; name: string; courseId: string; courseName: string; startTime: string; endTime: string; capacity: number; studentCount: number }[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('courses')
    const [showAddCourse, setShowAddCourse] = useState(false)
    const [showAddBatch, setShowAddBatch] = useState(false)
    const [courseForm, setCourseForm] = useState({ name: '', description: '', duration: '', fees: '', subjects: '', installmentCount: '1' })
    const [batchForm, setBatchForm] = useState({ name: '', courseId: '', startTime: '', endTime: '', capacity: '30' })
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState('')

    const fetchData = async () => {
        if (!token) return
        const [c, b] = await Promise.all([
            fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch('/api/batches', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ])
        if (c.success) setCourses(c.data)
        if (b.success) setBatches(b.data)
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [token])

    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const res = await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...courseForm, subjects: courseForm.subjects.split(',').map(s => s.trim()) }),
        })
        const data = await res.json()
        setSaving(false)
        if (data.success) { 
            setToast('Course added!')
            setShowAddCourse(false)
            setCourseForm({ name: '', description: '', duration: '', fees: '', subjects: '', installmentCount: '1' })
            fetchData()
            setTimeout(() => setToast(''), 3000) 
        }
    }

    const handleAddBatch = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const res = await fetch('/api/batches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(batchForm),
        })
        const data = await res.json()
        setSaving(false)
        if (data.success) { setToast('Batch added!'); setShowAddBatch(false); fetchData(); setTimeout(() => setToast(''), 3000) }
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">📚 Courses & Batches</h1>
                    <p className="page-subtitle">{courses.length} courses • {batches.length} batches</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowAddCourse(true)} className="btn btn-secondary">➕ Course</button>
                    <button onClick={() => setShowAddBatch(true)} className="btn btn-primary">➕ Batch</button>
                </div>
            </div>

            {toast && <div className="toast toast-success" style={{ position: 'relative', marginBottom: '16px', maxWidth: '100%' }}>✓ {toast}</div>}

            <div className="tabs">
                <button className={`tab ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>📚 Courses ({courses.length})</button>
                <button className={`tab ${activeTab === 'batches' ? 'active' : ''}`} onClick={() => setActiveTab('batches')}>🕐 Batches ({batches.length})</button>
            </div>

            {activeTab === 'courses' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {loading ? <div style={{ padding: '40px' }}><div className="spinner" /></div> :
                        courses.map(c => (
                            <div key={c.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <h3 style={{ fontWeight: '700', fontSize: '16px' }}>{c.name}</h3>
                                    <span className={`badge ${c.isActive ? 'badge-success' : 'badge-gray'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>{c.description}</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                                    <div style={{ padding: '10px', background: 'var(--surface-2)', borderRadius: '8px', textAlign: 'center' }}>
                                        <div style={{ fontWeight: '800', color: '#10b981', fontSize: '18px' }}>₹{(c.fees / 1000).toFixed(0)}K</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fees</div>
                                    </div>
                                    <div style={{ padding: '10px', background: 'var(--surface-2)', borderRadius: '8px', textAlign: 'center' }}>
                                        <div style={{ fontWeight: '800', color: '#6366f1', fontSize: '18px' }}>{c.installmentCount}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Installments</div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase' }}>Subjects & Details</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        <span style={{ padding: '3px 10px', background: 'rgba(110,231,183,0.1)', color: '#10b981', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{c.duration}</span>
                                        {c.subjects.map(s => (
                                            <span key={s} style={{ padding: '3px 10px', background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {activeTab === 'batches' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {loading ? <div style={{ padding: '40px' }}><div className="spinner" /></div> :
                        batches.map(b => (
                            <div key={b.id} className="card">
                                <h3 style={{ fontWeight: '700', fontSize: '15px', marginBottom: '6px' }}>{b.name}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>{b.courseName}</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                    <div style={{ padding: '10px', background: 'var(--surface-2)', borderRadius: '8px', textAlign: 'center' }}>
                                        <div style={{ fontWeight: '800', color: '#6366f1', fontSize: '16px' }}>{b.startTime || '—'}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Start</div>
                                    </div>
                                    <div style={{ padding: '10px', background: 'var(--surface-2)', borderRadius: '8px', textAlign: 'center' }}>
                                        <div style={{ fontWeight: '800', color: '#ec4899', fontSize: '16px' }}>{b.endTime || '—'}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>End</div>
                                    </div>
                                </div>
                                <div className="progress-bar" style={{ marginBottom: '6px' }}>
                                    <div className="progress-fill" style={{ width: `${Math.min((b.studentCount / b.capacity) * 100, 100)}%` }} />
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{b.studentCount} students enrolled</span>
                                    <span>Capacity: {b.capacity}</span>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Add Course Modal */}
            {showAddCourse && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 style={{ fontWeight: '700' }}>📚 Add Course</h3>
                            <button onClick={() => setShowAddCourse(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <form onSubmit={handleAddCourse}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div><label className="label">Course Name *</label><input className="input" placeholder="JEE Foundation" value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} required /></div>
                                <div><label className="label">Description</label><input className="input" placeholder="IIT-JEE preparation for Class 11-12" value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} /></div>
                                <div className="grid-cols-2">
                                    <div><label className="label">Duration</label><input className="input" placeholder="2 Years" value={courseForm.duration} onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })} /></div>
                                    <div><label className="label">Fees (₹)</label><input className="input" type="number" placeholder="45000" value={courseForm.fees} onChange={e => setCourseForm({ ...courseForm, fees: e.target.value })} /></div>
                                </div>
                                <div className="grid-cols-2">
                                    <div>
                                        <label className="label">Installments (Months)</label>
                                        <select className="input" value={courseForm.installmentCount} onChange={e => setCourseForm({ ...courseForm, installmentCount: e.target.value })}>
                                            {[1, 2, 3, 4, 5, 6].map(i => <option key={i} value={i}>{i} Installment{i > 1 ? 's' : ''}</option>)}
                                        </select>
                                    </div>
                                    <div><label className="label">Subjects (comma separated)</label><input className="input" placeholder="Physics, Chemistry, Maths" value={courseForm.subjects} onChange={e => setCourseForm({ ...courseForm, subjects: e.target.value })} /></div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowAddCourse(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳' : '✅ Add Course'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Batch Modal */}
            {showAddBatch && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 style={{ fontWeight: '700' }}>🕐 Add Batch</h3>
                            <button onClick={() => setShowAddBatch(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <form onSubmit={handleAddBatch}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div><label className="label">Batch Name *</label><input className="input" placeholder="JEE Morning Batch" value={batchForm.name} onChange={e => setBatchForm({ ...batchForm, name: e.target.value })} required /></div>
                                <div><label className="label">Course *</label>
                                    <select className="input" value={batchForm.courseId} onChange={e => setBatchForm({ ...batchForm, courseId: e.target.value })} required>
                                        <option value="">Select Course</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select></div>
                                <div className="grid-cols-2">
                                    <div><label className="label">Start Time</label><input className="input" type="time" value={batchForm.startTime} onChange={e => setBatchForm({ ...batchForm, startTime: e.target.value })} /></div>
                                    <div><label className="label">End Time</label><input className="input" type="time" value={batchForm.endTime} onChange={e => setBatchForm({ ...batchForm, endTime: e.target.value })} /></div>
                                </div>
                                <div><label className="label">Capacity</label><input className="input" type="number" value={batchForm.capacity} onChange={e => setBatchForm({ ...batchForm, capacity: e.target.value })} /></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowAddBatch(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳' : '✅ Add Batch'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
