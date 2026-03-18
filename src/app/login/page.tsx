'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

function LoginForm() {
    const { login } = useAuth()
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const result = await login(email, password)
        setLoading(false)
        if (result.success) {
            router.push('/dashboard')
        } else {
            setError(result.error || 'Login failed')
        }
    }

    const fillDemo = (role: string) => {
        if (role === 'admin') { setEmail('admin@coaching.com'); setPassword('admin123') }
        if (role === 'teacher') { setEmail('teacher@coaching.com'); setPassword('teacher123') }
        if (role === 'super') { setEmail('superadmin@coachpro.in'); setPassword('super123') }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            {/* Background */}
            <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: '420px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>🎓</div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>Welcome back!</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>Sign in to CoachPro Dashboard</p>
                </div>

                {/* Demo credentials */}
                <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🧪 Demo Accounts</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[['Admin', 'admin'], ['Teacher', 'teacher'], ['Super Admin', 'super']].map(([label, role]) => (
                            <button key={role} onClick={() => fillDemo(role)} style={{ padding: '4px 12px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px', color: 'var(--primary-light)', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div className="card" style={{ borderRadius: '20px', padding: '32px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label className="label">Email Address</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="admin@coaching.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label className="label" style={{ marginBottom: 0 }}>Password</label>
                                <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--primary-light)', fontWeight: '600', textDecoration: 'none' }}>Forgot password?</Link>
                            </div>
                            <input
                                type="password"
                                className="input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '14px', color: '#fca5a5' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '12px' }}>
                            {loading ? <><div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />  Signing in...</> : '🔑 Sign In'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        <Link href="/register" style={{ color: 'var(--primary-light)', fontWeight: '600' }}>Start Free Trial</Link>
                    </p>
                </div>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to Home</Link>
                </p>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <AuthProvider>
            <LoginForm />
        </AuthProvider>
    )
}
