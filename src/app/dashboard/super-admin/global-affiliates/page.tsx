'use client'
import { useState, useEffect } from 'react'

export default function SuperAdminAffiliates() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [aggregating, setAggregating] = useState(false)
    const [payingId, setPayingId] = useState<string | null>(null)
    const [txnRef, setTxnRef] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('cp_token')
            const res = await fetch('/api/super-admin/global-affiliates', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const result = await res.json()
            if (result.success) setData(result)
        } catch (error) {
            console.error(error)
        }
        setLoading(false)
    }

    const handleAggregate = async () => {
        if (!confirm('Run monthly aggregation? This will convert pending commissions into payouts.')) return
        setAggregating(true)
        try {
            const token = localStorage.getItem('cp_token')
            const now = new Date()
            const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

            const targetMonth = prompt("Enter month to aggregate (YYYY-MM)", monthStr) || monthStr

            const res = await fetch('/api/super-admin/global-affiliates/aggregate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ month: targetMonth })
            })
            const result = await res.json()
            if (result.success) {
                alert(result.message)
                fetchData()
            } else {
                alert(result.error || 'Failed to aggregate')
            }
        } catch (error) {
            alert('Error running aggregation')
        }
        setAggregating(false)
    }

    const handlePay = async (payoutId: string) => {
        if (!txnRef.trim()) {
            alert('Please enter a Transaction Reference')
            return
        }
        try {
            const token = localStorage.getItem('cp_token')
            const res = await fetch('/api/super-admin/global-affiliates/payout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ payoutId, transactionReference: txnRef })
            })
            const result = await res.json()
            if (result.success) {
                alert('Payout marked as PAID')
                setPayingId(null)
                setTxnRef('')
                fetchData()
            } else {
                alert(result.error)
            }
        } catch (error) {
            alert('Error paying affiliate')
        }
    }

    if (loading) return <div style={{ padding: '24px' }}>Loading Super Admin Data...</div>
    if (!data) return <div style={{ padding: '24px', color: 'red' }}>Failed to load data</div>

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>Global Affiliates Management</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>System B - Independent Global Affiliate Network</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleAggregate}
                    disabled={aggregating}
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                    {aggregating ? 'Aggregating...' : '🔄 Run Monthly Aggregation'}
                </button>
            </div>

            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Registered Affiliates Overview</h2>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Affiliate Link Info</th>
                                <th>Referrals</th>
                                <th>Pending Sub. Commission</th>
                                <th>Pending Mkt. Commission</th>
                                <th style={{ textAlign: 'right' }}>Total Un-Aggregated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.affiliates.map((a: any) => (
                                <tr key={a.id}>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{a.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.email}</div>
                                        <span className="badge" style={{ background: 'var(--surface-2)', marginTop: '4px', fontSize: '10px' }}>
                                            Code: {a.code}
                                        </span>
                                    </td>
                                    <td>{a.totalReferred} tenants</td>
                                    <td>₹{a.pendingSubscriptionCommission.toLocaleString()}</td>
                                    <td>₹{a.pendingMarketplaceCommission.toLocaleString()}</td>
                                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#fbbf24' }}>
                                        ₹{a.totalPendingUnaggregated.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {data.affiliates.length === 0 && (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No affiliates found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Monthly Payouts List</h2>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Affiliate Name</th>
                                <th>Comm. Breakdown</th>
                                <th>Total Payout</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.payouts.map((p: any) => (
                                <tr key={p.id}>
                                    <td><strong style={{ color: 'white' }}>{p.month}</strong></td>
                                    <td>{p.affiliateName}</td>
                                    <td>
                                        <div style={{ fontSize: '12px' }}>Sub: ₹{p.subCommission.toLocaleString()}</div>
                                        <div style={{ fontSize: '12px' }}>Mkt: ₹{p.mktCommission.toLocaleString()}</div>
                                    </td>
                                    <td style={{ fontWeight: '700', color: 'var(--primary-light)' }}>
                                        ₹{p.totalAmount.toLocaleString()}
                                    </td>
                                    <td>
                                        <span className={`badge ${p.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                                            {p.status}
                                        </span>
                                        {p.status === 'PAID' && <div style={{ fontSize: '10px', marginTop: '4px', color: 'var(--text-muted)' }}>Ref: {p.tzRef}</div>}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {p.status === 'PENDING' && payingId !== p.id && (
                                            <button className="btn btn-secondary btn-sm" onClick={() => setPayingId(p.id)}>
                                                Mark as PAID
                                            </button>
                                        )}
                                        {payingId === p.id && (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    style={{ padding: '6px', fontSize: '12px', width: '140px' }}
                                                    placeholder="Txn Reference ID"
                                                    value={txnRef}
                                                    onChange={e => setTxnRef(e.target.value)}
                                                />
                                                <button className="btn btn-primary btn-sm" onClick={() => handlePay(p.id)}>Confirm</button>
                                                <button className="btn btn-secondary btn-sm" onClick={() => { setPayingId(null); setTxnRef('') }}>Cancel</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {data.payouts.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No calculated payouts</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
