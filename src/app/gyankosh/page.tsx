'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

interface Product {
    id: string
    title: string
    description: string
    category: string
    price: number
    discount: number
    imageUrl: string
}

function GyankoshMarketplaceContent() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const searchParams = useSearchParams()

    useEffect(() => {
        // Check if affiliate referral exists in URL
        const ref = searchParams.get('ref')
        if (ref) {
            localStorage.setItem('gyankosh_affiliate_id', ref)
        }

        fetch('/api/marketplace/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setProducts(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load products', err)
                setLoading(false)
            })
    }, [searchParams])

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color, #0f0f1a)' }}>
            {/* Navbar Minimalist */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100, padding: '0 24px', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(15,15,26,0.9)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '36px', height: '36px', background: 'linear-gradient(135deg, #10b981, #059669)',
                            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                        }}>📚</div>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>Gyan<span style={{ color: '#10b981' }}>Kosh</span></span>
                    </Link>
                </div>
                <div>
                    <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Back to CoachPro</Link>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', color: 'white', marginBottom: '20px' }}>
                    Welcome to <span style={{ color: '#10b981' }}>Gyankosh</span>
                </h1>
                <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '40px' }}>
                    Premium Course Materials, Mock Tests, Question Banks, and E-Books curated for top-tier exam preparation.
                </p>

                {/* Main Search Bar */}
                <div style={{ display: 'flex', gap: '8px', background: 'var(--surface, #1e1e2e)', padding: '8px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                    <div style={{ padding: '12px 16px', fontSize: '20px' }}>🔍</div>
                    <input
                        type="text"
                        placeholder="Search products by name or keywords..."
                        style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '16px' }}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                        onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
                    >
                        Search
                    </button>
                </div>
            </section>

            {/* Products Grid */}
            <section style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: 'white', padding: '60px' }}>Loading marketplace...</div>
                ) : (() => {
                    const filteredProducts = products.filter(p => {
                        const q = searchQuery.toLowerCase()
                        return p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
                    })

                    return filteredProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px', background: 'var(--surface)', borderRadius: '12px' }}>
                            {searchQuery ? 'No materials found matching your search. Please try different keywords!' : 'No materials available yet. Please check back later!'}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                            {filteredProducts.map(product => {
                                const discountedPrice = product.price - (product.price * (product.discount / 100))

                                return (
                                    <div key={product.id} style={{
                                        background: 'var(--surface, #1e1e2e)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', padding: '20px',
                                        display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', cursor: 'pointer'
                                    }}
                                        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-5px)')}
                                        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                                        <div style={{
                                            width: '100%', height: '180px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', marginBottom: '16px',
                                            position: 'relative', overflow: 'hidden'
                                        }}>
                                            {product.imageUrl ? <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📚'}
                                            {product.discount > 0 && (
                                                <div style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                                    {product.discount}% OFF
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>
                                                {product.category.replace('_', ' ')}
                                            </div>
                                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>{product.title}</h3>
                                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {product.description || 'Premium material for your coaching preparation.'}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: 'auto' }}>
                                            <div>
                                                {product.discount > 0 ? (
                                                    <>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.price}</div>
                                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>₹{discountedPrice}</div>
                                                    </>
                                                ) : (
                                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>₹{product.price}</div>
                                                )}
                                            </div>
                                            <Link href={`/gyankosh/checkout/${product.id}`} style={{
                                                background: 'white', color: 'black', padding: '8px 16px', borderRadius: '8px',
                                                textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', border: '1px solid white', transition: 'all 0.2s'
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'white' }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'black' }}>
                                                Buy Now
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )
                })()}
            </section>

            {/* Footer Minimal */}
            <footer style={{ padding: '40px 24px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    © 2025 Gyankosh Marketplace by CoachPro. Elevating Education.
                </p>
            </footer>
        </div>
    )
}

import { Suspense } from 'react'

export default function GyankoshMarketplace() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a', color: 'white' }}>Loading Marketplace...</div>}>
            <GyankoshMarketplaceContent />
        </Suspense>
    )
}
