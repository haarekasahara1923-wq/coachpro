'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { hasFeature, NAV_FEATURE_MAP, PlanFeatures } from '@/lib/planLimits'

const navItems = [
    {
        group: 'OVERVIEW', items: [
            { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
            { href: '/dashboard/analytics', icon: '📊', label: 'Analytics' },
        ]
    },
    {
        group: 'STUDENTS', items: [
            { href: '/dashboard/students', icon: '👨‍🎓', label: 'All Students' },
            { href: '/dashboard/students/add', icon: '➕', label: 'Add Student' },
            { href: '/dashboard/attendance', icon: '✅', label: 'Attendance' },
        ]
    },
    {
        group: 'ACADEMICS', items: [
            { href: '/dashboard/courses', icon: '📚', label: 'Courses & Batches' },
            { href: '/dashboard/mock-tests', icon: '📝', label: 'Mock Tests' },
            { href: '/dashboard/ai-tools', icon: '🤖', label: 'AI Tools' },
        ]
    },
    {
        group: 'FINANCE', items: [
            { href: '/dashboard/fees', icon: '💰', label: 'Fee Management' },
            { href: '/dashboard/payments', icon: '💳', label: 'Payments' },
            { href: '/dashboard/expenses', icon: '📉', label: 'Expenses' },
            { href: '/dashboard/affiliate', icon: '🤝', label: 'Affiliate Earnings' },
        ]
    },
    {
        group: 'MANAGEMENT', items: [
            { href: '/dashboard/teachers', icon: '👩‍🏫', label: 'Teachers' },
            { href: '/dashboard/leads', icon: '📈', label: 'Lead Management' },
            { href: '/dashboard/whatsapp', icon: '💬', label: 'WhatsApp' },
        ]
    },
    {
        group: 'SETTINGS', items: [
            { href: '/dashboard/profile', icon: '🏢', label: 'Coaching Profile' },
            { href: '/dashboard/subscription', icon: '⭐', label: 'Subscription' },
        ]
    },
]

const superAdminNav = [
    {
        group: 'SUPER ADMIN', items: [
            { href: '/dashboard/super-admin', icon: '👑', label: 'Platform Overview' },
            { href: '/dashboard/super-admin/tenants', icon: '🏗️', label: 'All Tenants' },
            { href: '/dashboard/super-admin/subscriptions', icon: '💎', label: 'Subscriptions' },
            { href: '/dashboard/super-admin/gyankosh', icon: '🛒', label: 'Gyankosh Admin' },
        ]
    },
]

function DashboardSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
    const pathname = usePathname()
    const { user, tenant, subscription, logout } = useAuth()
    const isSuperAdmin = user?.role === 'SUPER_ADMIN'
    const allNavItems = isSuperAdmin ? superAdminNav : navItems

    const currentPlan = subscription?.plan || 'BASIC'

    return (
        <>
            {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }} className="hide-desktop" />}
            <aside className={`sidebar ${open ? 'open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">{isSuperAdmin ? '👑' : '🎓'}</div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'white' }}>CoachPro</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {isSuperAdmin ? 'Super Admin Portal' : (tenant?.name || 'Loading...')}
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="sidebar-nav">
                    {allNavItems.map(group => (
                        <div key={group.group}>
                            <div className="sidebar-section-title">{group.group}</div>
                            {group.items.map(item => {
                                const requiredFeature = NAV_FEATURE_MAP[item.href]
                                const isLocked = requiredFeature && !hasFeature(currentPlan, requiredFeature)

                                return (
                                    <Link
                                        key={item.href}
                                        href={isLocked ? '/dashboard/subscription' : item.href}
                                        className={`nav-item ${pathname === item.href ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                        onClick={onClose}
                                        style={isLocked ? { opacity: 0.6 } : {}}
                                        title={isLocked ? 'Upgrade to unlock this feature' : ''}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                            <span style={{ fontSize: '16px' }}>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </div>
                                        {isLocked && <span style={{ fontSize: '12px' }}>🔒</span>}
                                    </Link>
                                )
                            })}
                        </div>
                    ))}

                    {/* Subscription badge - hide for super admin */}
                    {!isSuperAdmin && (
                        <Link href="/dashboard/subscription" style={{ textDecoration: 'none' }}>
                            <div style={{ margin: '12px 8px', padding: '12px', background: 'rgba(99,102,241,0.1)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                            >
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Plan</div>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary-light)' }}>
                                    {currentPlan} {subscription?.status === 'ACTIVE' ? 'Active ✓' : 'Trial ⏳'}
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* User */}
                    <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{user?.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{user?.role?.replace('_', ' ')}</div>
                            </div>
                        </div>
                        <button onClick={logout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '13px' }}>
                            🚪 Logout
                        </button>
                    </div>
                </nav>
            </aside>
        </>
    )
}

function DashboardHeader({ onMenuClick }: { onMenuClick: () => void }) {
    const pathname = usePathname()
    const { tenant } = useAuth()

    const getPageTitle = () => {
        const map: Record<string, string> = {
            '/dashboard': 'Dashboard',
            '/dashboard/analytics': 'Analytics',
            '/dashboard/students': 'Students',
            '/dashboard/students/add': 'Add Student',
            '/dashboard/attendance': 'Attendance',
            '/dashboard/courses': 'Courses & Batches',
            '/dashboard/mock-tests': 'Mock Tests',
            '/dashboard/ai-tools': 'AI Tools',
            '/dashboard/fees': 'Fee Management',
            '/dashboard/payments': 'Payments',
            '/dashboard/expenses': 'Expenses',
            '/dashboard/teachers': 'Teachers',
            '/dashboard/leads': 'Lead Management',
            '/dashboard/whatsapp': 'WhatsApp Automation',
            '/dashboard/profile': 'Coaching Profile',
            '/dashboard/subscription': 'Subscription',
            '/dashboard/affiliate': 'Affiliate Earnings',
            '/dashboard/super-admin': 'Platform Overview',
            '/dashboard/super-admin/tenants': 'All Tenants',
            '/dashboard/super-admin/subscriptions': 'Subscriptions',
            '/dashboard/super-admin/gyankosh': 'Gyankosh Admin',
        }
        return map[pathname] || 'Dashboard'
    }

    return (
        <header className="header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={onMenuClick} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px', padding: '4px' }} id="mobile-menu-btn">
                    ☰
                </button>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{getPageTitle()}</h2>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                    Live
                </div>
                <Link href="/dashboard/leads" style={{ position: 'relative', textDecoration: 'none' }}>
                    <div style={{ padding: '8px', background: 'var(--surface-2)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '16px' }}>🔔</div>
                </Link>
                <Link href="/dashboard/profile">
                    <div className="avatar">
                        {tenant?.name?.charAt(0) || 'C'}
                    </div>
                </Link>
            </div>
        </header>
    )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login')
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px', margin: '0 auto 16px' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Loading CoachPro...</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div>
            <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <main className="main-content">
                <div className="page-content fade-in">
                    {children}
                </div>
            </main>
        </div>
    )
}

export function FeatureGate({ feature, children }: { feature: keyof PlanFeatures, children: React.ReactNode }) {
    const { subscription } = useAuth()
    const currentPlan = subscription?.plan || 'BASIC'

    if (!hasFeature(currentPlan, feature)) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Feature Locked</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                    This feature is not available on your current {currentPlan} plan. Upgrade your subscription to unlock this powerful capability for your coaching center.
                </p>
                <Link href="/dashboard/subscription" className="btn btn-primary">
                    View Upgrade Options
                </Link>
            </div>
        )
    }

    return <>{children}</>
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <DashboardShell>{children}</DashboardShell>
        </AuthProvider>
    )
}
