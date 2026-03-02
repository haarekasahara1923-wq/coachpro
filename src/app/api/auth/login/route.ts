import { NextRequest, NextResponse } from 'next/server'
import { store, generateId } from '@/lib/store'
import { signAccessToken, signRefreshToken, comparePassword, hashPassword } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
        }

        const user = store.users.find(u => u.email === email.toLowerCase() && u.isActive)
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const isValid = await comparePassword(password, user.password)
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const tenant = store.tenants.find(t => t.id === user.tenantId)
        const subscription = store.subscriptions.find(s => s.tenantId === user.tenantId)

        const payload = {
            userId: user.id,
            tenantId: user.tenantId,
            role: user.role,
            email: user.email,
        }

        const accessToken = signAccessToken(payload)
        const refreshToken = signRefreshToken(payload)

        user.lastLogin = new Date()

        return NextResponse.json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
                phone: user.phone,
            },
            tenant: tenant ? {
                id: tenant.id,
                name: tenant.name,
                logo: tenant.logo,
                themeColor: tenant.themeColor,
                phone: tenant.phone,
                address: tenant.address,
            } : null,
            subscription: subscription || null,
        })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
