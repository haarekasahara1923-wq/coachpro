'use client'

import { useState, useEffect } from 'react'

export default function AdminGyankosh() {
    const [products, setProducts] = useState<any[]>([])
    const [withdrawals, setWithdrawals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        title: '', description: '', category: 'COURSE_MATERIAL',
        price: 0, discount: 0, imageUrl: '', fileUrl: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [pRes, wRes] = await Promise.all([
                fetch('/api/super-admin/gyankosh/products'),
                fetch('/api/super-admin/gyankosh/withdrawals')
            ])
            const pData = await pRes.json()
            const wData = await wRes.json()
            if (!pData.error) setProducts(pData)
            if (!wData.error) setWithdrawals(wData)
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    const handleCreateProduct = async () => {
        try {
            const res = await fetch('/api/super-admin/gyankosh/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                alert('Product created successfully')
                setShowModal(false)
                fetchData()
            } else {
                alert('Failed to create product.')
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleWithdrawalStatus = async (id: string, status: string) => {
        try {
            const res = await fetch('/api/super-admin/gyankosh/withdrawals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            })
            if (res.ok) {
                alert('Status updated')
                fetchData()
            }
        } catch (e) {
            console.error(e)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Gyankosh Administration</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Product</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Products Table */}
                <div className="card">
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Products</h3>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.title}</td>
                                        <td>{p.category}</td>
                                        <td>₹{p.price} (-{p.discount}%)</td>
                                        <td>{p.isActive ? 'Active' : 'Inactive'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Withdrawals Table */}
                <div className="card">
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Withdrawal Requests</h3>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Tenant</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals.map(w => (
                                    <tr key={w.id}>
                                        <td>{w.tenant?.name}</td>
                                        <td>₹{w.amount}</td>
                                        <td>
                                            <span className={`badge ${w.status === 'PENDING' ? 'badge-warning' : w.status === 'PAID' ? 'badge-success' : 'badge-danger'}`}>
                                                {w.status}
                                            </span>
                                        </td>
                                        <td>
                                            {w.status === 'PENDING' && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button style={{ padding: '4px 8px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                        onClick={() => handleWithdrawalStatus(w.id, 'PAID')}>Mark Paid</button>
                                                    <button style={{ padding: '4px 8px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                        onClick={() => handleWithdrawalStatus(w.id, 'REJECTED')}>Reject</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '500px' }}>
                        <h2 style={{ marginBottom: '16px' }}>Add New Product</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Title</label>
                                <input type="text" className="input" style={{ width: '100%' }} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Category</label>
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
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Price (₹)</label>
                                    <input type="number" className="input" style={{ width: '100%' }} value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Discount (%)</label>
                                    <input type="number" className="input" style={{ width: '100%' }} value={formData.discount} onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Cover Image URL</label>
                                <input type="text" className="input" style={{ width: '100%' }} value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>File URL (Provided after purchase)</label>
                                <input type="text" className="input" style={{ width: '100%' }} value={formData.fileUrl} onChange={e => setFormData({ ...formData, fileUrl: e.target.value })} />
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
