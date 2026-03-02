'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminGyankosh() {
    const { token } = useAuth()
    const [products, setProducts] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [withdrawals, setWithdrawals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'withdrawals'>('products')
    const [showModal, setShowModal] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [formData, setFormData] = useState({
        title: '', description: '', category: 'COURSE_MATERIAL',
        price: 0, discount: 0, imageUrl: '', fileUrl: ''
    })

    const authHeaders = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [pRes, wRes] = await Promise.all([
                fetch('/api/super-admin/gyankosh/products', { headers: authHeaders }),
                fetch('/api/super-admin/gyankosh/withdrawals', { headers: authHeaders })
            ])
            const pData = await pRes.json()
            const wData = await wRes.json()
            if (pData.products) { setProducts(pData.products); setOrders(pData.orders || []) }
            if (Array.isArray(wData)) setWithdrawals(wData)
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const handleCreateProduct = async () => {
        if (!formData.title || formData.price <= 0) { alert('Title and Price are required.'); return }
        try {
            const res = await fetch('/api/super-admin/gyankosh/products', {
                method: 'POST', headers: authHeaders, body: JSON.stringify(formData)
            })
            if (res.ok) { alert('Product created!'); setShowModal(false); setFormData({ title: '', description: '', category: 'COURSE_MATERIAL', price: 0, discount: 0, imageUrl: '', fileUrl: '' }); fetchData() }
            else alert('Failed to create product.')
        } catch (e) { console.error(e) }
    }

    const handleToggleProduct = async (id: string, isActive: boolean) => {
        try {
            await fetch('/api/super-admin/gyankosh/products', {
                method: 'PUT', headers: authHeaders,
                body: JSON.stringify({ id, isActive, action: 'toggle' })
            })
            fetchData()
        } catch (e) { console.error(e) }
    }

    const handleWithdrawalStatus = async (id: string, status: string) => {
        if (!window.confirm(`Mark this withdrawal as ${status}?`)) return
        try {
            const res = await fetch('/api/super-admin/gyankosh/withdrawals', {
                method: 'PUT', headers: authHeaders,
                body: JSON.stringify({ id, status })
            })
            if (res.ok) { alert('Updated!'); fetchData() }
        } catch (e) { console.error(e) }
    }

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>

    const tabs = [
        { key: 'products', label: '📦 Products', count: products.length },
        { key: 'orders', label: '🧾 Orders', count: orders.length },
        { key: 'withdrawals', label: '💸 Withdrawals', count: withdrawals.length },
    ]

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>🛒 Gyankosh Administration</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Product</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                        style={{
                            padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none',
                            background: activeTab === tab.key ? 'var(--primary)' : 'var(--surface)',
                            color: activeTab === tab.key ? 'white' : 'var(--text-secondary)'
                        }}>
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Products Tab */}
            {activeTab === 'products' && (
                <div className="card" style={{ padding: 0 }}>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>Title</th><th>Category</th><th>Price</th><th>Discount</th><th>Drive Link</th><th>Status</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: '600' }}>{p.title}</td>
                                        <td><span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>{p.category.replace('_', ' ')}</span></td>
                                        <td>₹{p.price}</td>
                                        <td>{p.discount}%</td>
                                        <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {p.fileUrl ? <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', fontSize: '12px' }}>🔗 View Link</a> : '—'}
                                        </td>
                                        <td>
                                            <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-secondary" style={{ fontSize: '12px', padding: '4px 8px' }} onClick={() => handleToggleProduct(p.id, p.isActive)}>
                                                {p.isActive ? '⛔ Disable' : '✅ Enable'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No products yet. Click "+ Add Product" to create one.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className="card" style={{ padding: 0 }}>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>Buyer</th><th>Product</th><th>Amount</th><th>Commission</th><th>Affiliate</th><th>Status</th><th>Date</th></tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id}>
                                        <td>
                                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{o.studentName}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.email} | {o.phone}</div>
                                        </td>
                                        <td style={{ fontSize: '14px' }}>{o.product?.title || '—'}</td>
                                        <td style={{ fontWeight: '700', color: '#10b981' }}>₹{o.amount}</td>
                                        <td style={{ fontWeight: '600', color: '#f59e0b' }}>₹{o.commissionAmount}</td>
                                        <td style={{ fontSize: '12px' }}>{o.affiliateTenantId || '—'}</td>
                                        <td><span className={`badge ${o.status === 'SUCCESS' ? 'badge-success' : o.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>{o.status}</span></td>
                                        <td style={{ fontSize: '12px' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {orders.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No orders yet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Withdrawals Tab */}
            {activeTab === 'withdrawals' && (
                <div className="card" style={{ padding: 0 }}>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>Coaching</th><th>Amount</th><th>Status</th><th>Requested</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {withdrawals.map(w => (
                                    <tr key={w.id}>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{w.tenant?.name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>UPI: {w.tenant?.upiId || 'N/A'} | A/C: {w.tenant?.bankAccountNo || 'N/A'}</div>
                                        </td>
                                        <td style={{ fontWeight: '700' }}>₹{w.amount}</td>
                                        <td><span className={`badge ${w.status === 'PENDING' ? 'badge-warning' : w.status === 'PAID' ? 'badge-success' : 'badge-danger'}`}>{w.status}</span></td>
                                        <td style={{ fontSize: '12px' }}>{new Date(w.requestedAt).toLocaleDateString()}</td>
                                        <td>
                                            {w.status === 'PENDING' && (
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button style={{ padding: '4px 10px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                                        onClick={() => handleWithdrawalStatus(w.id, 'PAID')}>✅ Paid</button>
                                                    <button style={{ padding: '4px 10px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                                        onClick={() => handleWithdrawalStatus(w.id, 'REJECTED')}>❌ Reject</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {withdrawals.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No withdrawal requests.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Product Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
                    <div className="modal-content" style={{ width: '550px' }}>
                        <h2 style={{ marginBottom: '20px' }}>📦 Add New Digital Product</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Product Title *</label>
                                <input type="text" className="input" style={{ width: '100%' }} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., NEET Physics Complete Notes" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Description</label>
                                <textarea className="input" style={{ width: '100%', minHeight: '60px' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Category</label>
                                <select className="input" style={{ width: '100%' }} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="COURSE_MATERIAL">Course Material</option>
                                    <option value="MOCK_TEST">Mock Test</option>
                                    <option value="QUESTION_BANK">Question Bank</option>
                                    <option value="OLD_PAPER">Old Paper</option>
                                    <option value="INFOGRAPHIC">Infographic</option>
                                    <option value="EBOOK">E-Book</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Price (₹) *</label>
                                    <input type="number" className="input" style={{ width: '100%' }} value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Discount (%)</label>
                                    <input type="number" className="input" style={{ width: '100%' }} value={formData.discount} onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>📷 Cover Image *</label>
                                <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        setUploading(true)
                                        try {
                                            const uploadForm = new FormData()
                                            uploadForm.append('file', file)
                                            const res = await fetch('/api/upload', {
                                                method: 'POST',
                                                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                                                body: uploadForm
                                            })
                                            const data = await res.json()
                                            if (data.url) {
                                                setFormData(prev => ({ ...prev, imageUrl: data.url }))
                                                alert('Image uploaded!')
                                            } else {
                                                alert('Upload failed: ' + (data.error || 'Unknown error'))
                                            }
                                        } catch (err) { console.error(err); alert('Upload failed.') }
                                        setUploading(false)
                                    }}
                                />
                                {formData.imageUrl ? (
                                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                                        <img src={formData.imageUrl} alt="Cover" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                        <button onClick={() => { setFormData({ ...formData, imageUrl: '' }); if (fileInputRef.current) fileInputRef.current.value = '' }}
                                            style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                                    </div>
                                ) : (
                                    <div onClick={() => !uploading && fileInputRef.current?.click()}
                                        style={{ border: '2px dashed var(--border)', borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: uploading ? 'wait' : 'pointer', background: 'rgba(99,102,241,0.03)' }}>
                                        {uploading ? (
                                            <div style={{ color: 'var(--primary-light)', fontSize: '14px' }}>⏳ Uploading to Cloudinary...</div>
                                        ) : (
                                            <>
                                                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📷</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>Click to choose image</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>JPG, PNG, WebP supported</div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div style={{ background: 'rgba(16,185,129,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600', color: '#10b981' }}>📁 Google Drive Download Link *</label>
                                <input type="text" className="input" style={{ width: '100%' }} value={formData.fileUrl} onChange={e => setFormData({ ...formData, fileUrl: e.target.value })} placeholder="https://drive.google.com/file/d/.../view?usp=sharing" />
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                                    This Google Drive link will be auto-delivered to the buyer via email/WhatsApp after successful Razorpay payment.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreateProduct}>Save Product</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
