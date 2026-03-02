'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const plans = [
    { value: 'BASIC', label: 'Basic — ₹999/mo', desc: 'Up to 100 students' },
    { value: 'PRO', label: 'Pro — ₹2,999/mo ⭐', desc: 'Up to 500 students + AI features' },
    { value: 'ELITE', label: 'Elite — ₹5,999/mo', desc: 'Unlimited + Multi-branch' },
]

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        coachingName: '',
        plan: 'PRO',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()

            if (!data.success) {
                setError(data.error || 'Registration failed')
                setLoading(false)
                return
            }

            // Store auth data
            localStorage.setItem('cp_token', data.accessToken)
            localStorage.setItem('cp_user', JSON.stringify(data.user))
            localStorage.setItem('cp_tenant', JSON.stringify(data.tenant))
            localStorage.setItem('cp_refresh', data.refreshToken)

            setSuccess(true)
            setTimeout(() => router.push('/dashboard'), 1500)
        } catch {
            setError('Network error. Please try again.')
        }
        setLoading(false)
    }

    if (success) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>Welcome to CoachPro!</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>7-day free trial activated. Redirecting to dashboard...</p>
                    <div className="spinner" style={{ margin: '20px auto' }} />
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at top right, rgba(236,72,153,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: '480px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>🎓</div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>Start Free Trial</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>7 days free • No credit card required</p>
                </div>

                <div className="card" style={{ borderRadius: '20px', padding: '32px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="grid-cols-2" style={{ marginBottom: '16px' }}>
                            <div>
                                <label className="label">Your Name</label>
                                <input className="input" placeholder="Rajesh Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="label">Phone</label>
                                <input className="input" placeholder="9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label className="label">Coaching Center Name</label>
                            <input className="input" placeholder="Sharma Coaching Classes" value={form.coachingName} onChange={e => setForm({ ...form, coachingName: e.target.value })} required />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label className="label">Email Address</label>
                            <input type="email" className="input" placeholder="admin@yourcoaching.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label className="label">Password</label>
                            <input type="password" className="input" placeholder="Minimum 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label className="label">Select Plan (Free Trial)</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {plans.map(p => (
                                    <label key={p.value} style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                                        background: form.plan === p.value ? 'rgba(99,102,241,0.15)' : 'var(--surface-2)',
                                        border: `1px solid ${form.plan === p.value ? 'var(--primary)' : 'var(--border)'}`,
                                        transition: 'all 0.2s',
                                    }}>
                                        <input type="radio" name="plan" value={p.value} checked={form.plan === p.value} onChange={e => setForm({ ...form, plan: e.target.value })} style={{ accentColor: 'var(--primary)' }} />
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{p.label}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '14px', color: '#fca5a5' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '13px', background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}>
                            {loading ? <><div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Creating account...</> : '🚀 Start Free Trial'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: 'var(--primary-light)', fontWeight: '600' }}>Sign In</Link>
                    </p>
                </div>

                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    )
}
