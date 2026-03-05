'use client'
import Link from 'next/link'
import { useState } from 'react'

const features = [
  { icon: '👨‍🎓', title: 'Student Management', desc: 'Complete student profiles, admissions, batch management, and parent portals', color: '#6366f1' },
  { icon: '💰', title: 'Fee Collection', desc: 'Automated fee reminders, installment tracking, UPI/Cash/Bank payments', color: '#10b981' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Real-time insights on revenue, attendance, performance trends', color: '#f59e0b' },
  { icon: '📝', title: 'Mock Tests & Exams', desc: 'MCQ + Descriptive tests, auto evaluation, rank generation, report cards', color: '#ec4899' },
  { icon: '✅', title: 'Attendance System', desc: 'Daily attendance, bulk marking, QR-based, parent auto-alerts', color: '#06b6d4' },
  { icon: '🤖', title: 'AI Question Generator', desc: 'Generate MCQs and descriptive questions with AI for any subject', color: '#8b5cf6' },
  { icon: '💬', title: 'WhatsApp Automation', desc: 'Auto fee reminders, admission alerts, result notifications via WhatsApp', color: '#25d366' },
  { icon: '📈', title: 'Lead Management', desc: 'CRM for inquiries, follow-ups, conversion tracking, lead analytics', color: '#f97316' },
  { icon: '👩‍🏫', title: 'Teacher Management', desc: 'Teacher profiles, salary tracking, attendance, performance metrics', color: '#14b8a6' },
  { icon: '💼', title: 'Expense Tracking', desc: 'Track rent, salary, electricity, marketing with profit/loss reports', color: '#ef4444' },
  { icon: '🌐', title: 'Multi-Branch Support', desc: 'Manage multiple coaching branches from one centralized dashboard', color: '#a855f7' },
  { icon: '🔒', title: 'Enterprise Security', desc: 'AES-256 encryption, role-based access, audit logs, HTTPS only', color: '#64748b' },
]

const plans = [
  {
    name: 'Basic',
    price: '₹999',
    period: '/month',
    desc: 'Perfect for small coaching centers',
    features: ['Up to 100 students', '2 Teachers', 'Fee management', 'Basic attendance', 'Email support'],
    color: '#6366f1',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₹2,999',
    period: '/month',
    desc: 'Best for growing institutes',
    features: ['Up to 500 students', '10 Teachers', 'WhatsApp automation', 'Mock tests & AI', 'Analytics dashboard', 'Lead management', 'Priority support'],
    color: '#ec4899',
    popular: true,
  },
  {
    name: 'Elite',
    price: '₹5,999',
    period: '/month',
    desc: 'For large coaching chains',
    features: ['Unlimited students', 'Unlimited teachers', 'Multi-branch', 'White label', 'Custom domain', 'API access', 'Dedicated support', 'Franchise mode'],
    color: '#f59e0b',
    popular: false,
  },
]

const stats = [
  { value: '10,000+', label: 'Coaching Centers' },
  { value: '5 Lakh+', label: 'Students Managed' },
  { value: '₹50 Cr+', label: 'Fees Collected' },
  { value: '99.9%', label: 'Uptime SLA' },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="landing-bg" style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(15,15,26,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)', padding: '0 24px',
        height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          }}>🎓</div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>Coach<span style={{ color: '#818cf8' }}>Pro</span></span>
        </div>

        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {['Features', 'Pricing', 'About'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = 'white'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-secondary)'}>{item}</a>
          ))}
          <Link href="/affiliate-register" style={{ color: '#10b981', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>Partner Program</Link>
        </div>

        <div className="hide-mobile" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/gyankosh" className="btn" style={{ padding: '8px 18px', fontSize: '13px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>📚 GYANKOSH</Link>
          <Link href="/login" className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '13px' }}>Login</Link>
          <Link href="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>Free Trial 🚀</Link>
        </div>

        <div className="show-mobile" style={{ alignItems: 'center' }}>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="btn btn-secondary" style={{ padding: '8px', minWidth: '40px', justifyContent: 'center', fontSize: '18px' }}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu fade-in" style={{
          position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 99,
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          {['Features', 'Pricing', 'About'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: '600', textDecoration: 'none' }}>{item}</a>
          ))}
          <Link href="/affiliate-register" onClick={() => setMobileMenuOpen(false)} style={{ color: '#10b981', fontSize: '16px', fontWeight: '600', textDecoration: 'none' }}>Partner Program</Link>
          <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }}></div>
          <Link href="/gyankosh" onClick={() => setMobileMenuOpen(false)} className="btn" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', fontWeight: 'bold' }}>📚 GYANKOSH</Link>
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Login</Link>
          <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Free Trial 🚀</Link>
        </div>
      )}

      {/* Hero */}
      <section style={{ paddingTop: '120px', paddingBottom: '80px', textAlign: 'center', maxWidth: '900px', margin: '0 auto', padding: '140px 24px 80px' }}>
        <div className="hero-badge">
          🇮🇳 Made for India's Coaching Industry • AI-Powered
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: '900', lineHeight: '1.1', marginBottom: '24px', color: 'white' }}>
          Run Your Coaching Institute<br />
          <span className="gradient-text">10x Smarter with AI</span>
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.7' }}>
          India's most powerful coaching management platform. Automate admissions, fees, attendance, exams & parent communication — all in one place.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" className="btn btn-primary btn-lg">
            Start 7-Day Free Trial →
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            View Demo
          </Link>
        </div>
        <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
          ✓ No credit card required &nbsp;•&nbsp; ✓ Setup in 5 minutes &nbsp;•&nbsp; ✓ Cancel anytime
        </p>
      </section>

      {/* Stats */}
      <section style={{ padding: '40px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="stats-grid" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          {stats.map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: '32px', fontWeight: '900', color: 'white' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="hero-badge" style={{ margin: '0 auto 16px' }}>All-in-One Platform</div>
          <h2 style={{ fontSize: '40px', fontWeight: '800', color: 'white' }}>Everything You Need to Run<br /><span className="gradient-text">a Modern Coaching Center</span></h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '16px' }}>12+ powerful modules to automate every aspect of your institute</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" style={{ background: `${f.color}20`, fontSize: '28px' }}>{f.icon}</div>
              <h3 style={{ fontWeight: '700', marginBottom: '8px', fontSize: '16px' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '80px 24px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div className="hero-badge" style={{ margin: '0 auto 16px' }}>Simple Pricing</div>
            <h2 style={{ fontSize: '40px', fontWeight: '800', color: 'white' }}>Plans for Every <span className="gradient-text">Coaching Scale</span></h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Start free. Scale as you grow. Cancel anytime.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
            {plans.map(plan => (
              <div key={plan.name} className={`pricing-card ${plan.popular ? 'featured' : ''}`}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #ec4899, #6366f1)', padding: '4px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', color: 'white', whiteSpace: 'nowrap' }}>
                    ⭐ MOST POPULAR
                  </div>
                )}
                <div style={{ color: plan.color, fontSize: '14px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '42px', fontWeight: '900', color: 'white' }}>{plan.price}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>{plan.desc}</p>
                <ul style={{ listStyle: 'none', marginBottom: '28px' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: '8px', marginBottom: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      <span style={{ color: plan.color }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: plan.popular ? 'linear-gradient(135deg, #ec4899, #6366f1)' : undefined }}>
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '900', color: 'white', marginBottom: '16px' }}>
            Ready to Transform Your Coaching?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px' }}>
            Join 10,000+ coaching centers already using CoachPro. 7-day free trial, no credit card required.
          </p>
          <Link href="/register" className="btn btn-primary btn-lg" style={{ margin: '0 auto' }}>
            Get Started Free — 7 Days Trial 🚀
          </Link>
          <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            📞 Support: +91 9876543210 &nbsp;•&nbsp; 📧 hello@coachpro.in
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🎓</div>
          <span style={{ fontWeight: '800', fontSize: '16px' }}>CoachPro</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginBottom: '16px', fontSize: '14px' }}>
          <Link href="/affiliate-register" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>Become an Affiliate (Earn 40%)</Link>
          <Link href="/affiliate-login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Affiliate Login</Link>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          © 2025 CoachPro. Made with ❤️ in India. All rights reserved.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>
          Multi-Tenant SaaS • Powered by Next.js 14 • Secured with AES-256
        </p>
      </footer>
    </div>
  )
}
