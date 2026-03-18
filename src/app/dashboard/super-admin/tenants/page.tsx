'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AllTenantsPage() {
    const { user, token } = useAuth()
    const router = useRouter()
    const [tenants, setTenants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const authHeaders = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

    useEffect(() => {
        if (user && user.role !== 'SUPER_ADMIN') router.push('/dashboard')
        if (user && user.role === 'SUPER_ADMIN') fetchData()
    }, [user, router])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/super-admin/tenants', { headers: authHeaders })
            const data = await res.json()
            if (!data.error) setTenants(data.tenants || [])
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const handleAction = async (tenantId: string, action: string, plan?: string) => {
        const msg = action === 'block' ? 'Block this coaching center?' : action === 'unblock' ? 'Unblock this coaching center?' : `Mark as PAID (${plan || 'BASIC'})?`
        if (!window.confirm(msg)) return
        try {
            const res = await fetch('/api/super-admin/tenants', {
                method: 'PUT', headers: authHeaders,
                body: JSON.stringify({ tenantId, action, plan })
            })
            const data = await res.json()
            if (data.success) { alert(data.message); fetchData() }
            else alert(data.error || 'Failed')
        } catch (e) { console.error(e) }
    }

    if (!user || user.role !== 'SUPER_ADMIN') return null

    const filtered = tenants.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.phone || '').includes(search)
    )

    const planColors: Record<string, string> = { BASIC: '#6366f1', PRO: '#ec4899', ELITE: '#f59e0b' }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">🏫 All Coaching Centers</h1>
                    <p className="page-subtitle">Manage all registered coaching centers</p>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontWeight: '700', fontSize: '16px' }}>Total: {filtered.length} coaching center{filtered.length !== 1 ? 's' : ''}</h3>
                    <input className="input" placeholder="Search by name, email, phone..." style={{ width: '280px', padding: '8px 12px' }} value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading tenants...</div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Coaching Center</th>
                                    <th>Contact</th>
                                    <th>Plan</th>
                                    <th>Students</th>
                                    <th>Affiliate Earnings</th>
                                    <th>Balance</th>
                                    <th>Password</th>
                                    <th>Registered</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(t => {
                                    const pc = planColors[t.plan] || '#6366f1'
                                    return (
                                        <tr key={t.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '15px' }}>{t.name.charAt(0)}</div>
                                                    <div>
                                                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{t.name}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '13px' }}>{t.email || '—'}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.phone || '—'}</div>
                                            </td>
                                            <td>
                                                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: `${pc}20`, color: pc }}>{t.plan}</span>
                                            </td>
                                            <td style={{ fontWeight: '600' }}>{t.studentCount}</td>
                                            <td style={{ fontWeight: '700', color: '#10b981' }}>₹{t.totalEarnings || 0}</td>
                                            <td style={{ fontWeight: '600' }}>₹{t.availableBalance || 0}</td>
                                            <td>
                                                <code style={{ background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', color: '#818cf8', display: 'inline-block' }}>{t.adminPassword || '—'}</code>
                                                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '4px', fontSize: '11px' }} 
                                                    onClick={() => { navigator.clipboard.writeText(t.adminPassword); alert('Password copied!') }}>📋</button>
                                            </td>
                                            <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge ${t.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                    {t.isActive ? 'ACTIVE' : 'BLOCKED'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    <select className="input" style={{ padding: '4px 6px', fontSize: '11px', width: '80px' }} id={`plan-t-${t.id}`} defaultValue={t.plan}>
                                                        <option value="BASIC">BASIC</option>
                                                        <option value="PRO">PRO</option>
                                                        <option value="ELITE">ELITE</option>
                                                    </select>
                                                    <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontSize: '11px', padding: '4px 8px' }}
                                                        onClick={() => { const sel = document.getElementById(`plan-t-${t.id}`) as HTMLSelectElement; handleAction(t.id, 'mark_paid', sel.value) }}>✅ Paid</button>
                                                    {t.isActive ? (
                                                        <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', fontSize: '11px', padding: '4px 8px' }}
                                                            onClick={() => handleAction(t.id, 'block')}>⛔ Block</button>
                                                    ) : (
                                                        <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontSize: '11px', padding: '4px 8px' }}
                                                            onClick={() => handleAction(t.id, 'unblock')}>🟢 Unblock</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No coaching centers found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
