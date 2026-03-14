'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Share2, Copy, Check, X, ShoppingCart, ArrowRight, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')
    const [productCopyStatus, setProductCopyStatus] = useState<Record<string, 'idle' | 'copied'>>({})
    
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        // Check if affiliate referral exists in URL
        const ref = searchParams.get('ref')
        if (ref) {
            localStorage.setItem('gyankosh_affiliate_id', ref)
        }

        // Check if a specific product is requested via URL
        const productId = searchParams.get('p')

        fetch('/api/marketplace/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data)
                    if (productId) {
                        const product = data.find(p => p.id === productId)
                        if (product) setSelectedProduct(product)
                    }
                }
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load products', err)
                setLoading(false)
            })
    }, [searchParams])

    const handleShareStore = () => {
        const url = window.location.origin + window.location.pathname
        navigator.clipboard.writeText(url)
        setCopyStatus('copied')
        setTimeout(() => setCopyStatus('idle'), 2000)
    }

    const handleShareProduct = (e: React.MouseEvent, productId: string) => {
        e.stopPropagation()
        const url = `${window.location.origin}${window.location.pathname}?p=${productId}`
        navigator.clipboard.writeText(url)
        setProductCopyStatus(prev => ({ ...prev, [productId]: 'copied' }))
        setTimeout(() => {
            setProductCopyStatus(prev => ({ ...prev, [productId]: 'idle' }))
        }, 2000)
    }

    const filteredProducts = products.filter(p => {
        const q = searchQuery.toLowerCase()
        return p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
    })

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color, #0f0f1a)', color: 'white' }}>
            {/* Global Styles for responsiveness */}
            <style jsx global>{`
                @media (max-width: 768px) {
                    .products-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 12px !important;
                    }
                    .product-card {
                        padding: 12px !important;
                    }
                    .product-image-container {
                        height: 120px !important;
                    }
                    .product-title {
                        font-size: 14px !important;
                    }
                    .product-price {
                        font-size: 16px !important;
                    }
                    .hero-section {
                        padding: 40px 16px !important;
                    }
                }
            `}</style>

            {/* Navbar */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                        onClick={handleShareStore}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.1)', 
                            color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '8px 16px', 
                            borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        {copyStatus === 'copied' ? <Check size={16} /> : <Share2 size={16} />}
                        <span className="hide-mobile">{copyStatus === 'copied' ? 'Link Copied!' : 'Share Store'}</span>
                    </button>
                    <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }} className="hide-mobile">Back to CoachPro</Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="hero-section" style={{ padding: '60px 24px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '900', color: 'white', marginBottom: '16px' }}
                >
                    Digital <span style={{ color: '#10b981' }}>Products</span> Store
                </motion.h1>
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
                    Premium Course Materials, Mock Tests, and E-Books curated for your success.
                </p>

                {/* Main Search Bar */}
                <div style={{ display: 'flex', gap: '8px', background: 'var(--surface, #1e1e2e)', padding: '8px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                    <div style={{ padding: '8px 12px', fontSize: '18px' }}>🔍</div>
                    <input
                        type="text"
                        placeholder="Search materials..."
                        style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '16px' }}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </section>

            {/* Products Grid */}
            <section style={{ padding: '20px 24px 80px', maxWidth: '1200px', margin: '0 auto' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: 'white', padding: '60px' }}>Loading marketplace...</div>
                ) : filteredProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px', background: 'var(--surface)', borderRadius: '12px' }}>
                        {searchQuery ? 'No materials found matching your search.' : 'No materials available yet.'}
                    </div>
                ) : (
                    <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        {filteredProducts.map(product => {
                            const discountedPrice = product.price - (product.price * (product.discount / 100))
                            const isCopied = productCopyStatus[product.id] === 'copied'

                            return (
                                <motion.div 
                                    layout
                                    key={product.id} 
                                    className="product-card"
                                    onClick={() => setSelectedProduct(product)}
                                    style={{
                                        background: 'var(--surface, #1e1e2e)', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden', padding: '16px',
                                        display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative'
                                    }}
                                    whileHover={{ y: -5, borderColor: 'rgba(16, 185, 129, 0.4)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}
                                >
                                    {/* Quick Share Button */}
                                    <button 
                                        onClick={(e) => handleShareProduct(e, product.id)}
                                        style={{
                                            position: 'absolute', top: '24px', right: '24px', zIndex: 10,
                                            width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)',
                                            backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCopied ? '#10b981' : 'white', cursor: 'pointer'
                                        }}
                                    >
                                        {isCopied ? <Check size={14} /> : <Share2 size={14} />}
                                    </button>

                                    <div className="product-image-container" style={{
                                        width: '100%', height: '180px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '14px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', marginBottom: '16px',
                                        position: 'relative', overflow: 'hidden'
                                    }}>
                                        {product.imageUrl ? <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📚'}
                                        {product.discount > 0 && (
                                            <div style={{ position: 'absolute', top: 12, left: 12, background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                                                {product.discount}% OFF
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {product.category.replace('_', ' ')}
                                        </div>
                                        <h3 className="product-title" style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '8px', lineHeight: 1.3 }}>{product.title}</h3>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                                        <div>
                                            <span className="product-price" style={{ fontSize: '20px', fontWeight: '800', color: '#10b981' }}>₹{discountedPrice}</span>
                                            {product.discount > 0 && (
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>₹{product.price}</span>
                                            )}
                                        </div>
                                        <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
                                            <ArrowRight size={18} color="#10b981" />
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </section>

            {/* Product Detail Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{ 
                                position: 'relative', background: '#1a1a2e', width: '100%', maxWidth: '700px', 
                                maxHeight: '90vh', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', flexDirection: 'column'
                            }}
                        >
                            {/* Modal Header */}
                            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
                                <button 
                                    onClick={() => setSelectedProduct(null)}
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ overflowY: 'auto', flex: 1 }}>
                                <div style={{ height: '300px', width: '100%', background: 'rgba(16, 185, 129, 0.1)', position: 'relative' }}>
                                    {selectedProduct.imageUrl ? (
                                        <img src={selectedProduct.imageUrl} alt={selectedProduct.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '100px' }}>📚</div>
                                    )}
                                    {selectedProduct.discount > 0 && (
                                        <div style={{ position: 'absolute', bottom: 20, left: 20, background: '#ef4444', color: 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                                            SAVE {selectedProduct.discount}% TODAY
                                        </div>
                                    )}
                                </div>

                                <div style={{ padding: '32px' }}>
                                    <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {selectedProduct.category.replace('_', ' ')}
                                    </div>
                                    <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'white', marginBottom: '16px', lineHeight: 1.2 }}>
                                        {selectedProduct.title}
                                    </h2>
                                    
                                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 'bold' }}>Description</h4>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                            {selectedProduct.description || 'This premium digital product is designed to help you excel in your preparation. It contains curated content and expert insights.'}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                                        <div>
                                            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Price</div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                                <span style={{ fontSize: '32px', fontWeight: '900', color: '#10b981' }}>₹{selectedProduct.price - (selectedProduct.price * (selectedProduct.discount / 100))}</span>
                                                {selectedProduct.discount > 0 && (
                                                    <span style={{ fontSize: '18px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{selectedProduct.price}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', flex: '1', minWidth: '200px' }}>
                                            <button 
                                                onClick={(e) => handleShareProduct(e, selectedProduct.id)}
                                                style={{ 
                                                    padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', 
                                                    border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                            >
                                                {productCopyStatus[selectedProduct.id] === 'copied' ? <Check size={20} color="#10b981" /> : <Share2 size={20} />}
                                            </button>
                                            <Link 
                                                href={`/gyankosh/checkout/${selectedProduct.id}`}
                                                style={{ 
                                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                                    background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', 
                                                    padding: '16px 32px', borderRadius: '16px', textDecoration: 'none', 
                                                    fontSize: '18px', fontWeight: 'bold', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' 
                                                }}
                                            >
                                                <ShoppingCart size={20} />
                                                Buy Now
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer style={{ padding: '60px 24px', textAlign: 'center', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '24px', height: '24px', background: '#10b981', borderRadius: '6px' }} />
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>GyanKosh Marketplace</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '500px', margin: '0 auto' }}>
                    Elevate your coaching management and digital product selling with CoachPro.
                </p>
                <div style={{ marginTop: '24px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    © 2025 Namit Harish Chandra Sharma. All Rights Reserved.
                </div>
            </footer>
        </div>
    )
}

export default function GyankoshMarketplace() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a', color: 'white' }}>Loading Marketplace...</div>}>
            <GyankoshMarketplaceContent />
        </Suspense>
    )
}

