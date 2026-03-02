import { NextRequest, NextResponse } from 'next/server'
import { store, generateId } from '@/lib/store'
import { hashPassword, signAccessToken, signRefreshToken } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, phone, coachingName, plan } = await req.json()

        if (!name || !email || !password || !coachingName) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        // Check if email already exists
        const existingUser = store.users.find(u => u.email === email.toLowerCase())
        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
        }

        // Create tenant
        const tenantId = generateId()
        const tenant = {
            id: tenantId,
            name: coachingName,
            slug: slugify(coachingName) + '-' + Date.now().toString(36),
            themeColor: '#6366f1',
            phone: phone || '',
            email: email,
            isActive: true,
            createdAt: new Date(),
        }
        store.tenants.push(tenant)

        // Create admin user
        const hashedPassword = await hashPassword(password)
        const userId = generateId()
        const user = {
            id: userId,
            tenantId,
            email: email.toLowerCase(),
            phone: phone || '',
            password: hashedPassword,
            name,
            role: 'COACHING_ADMIN',
            isActive: true,
            createdAt: new Date(),
        }
        store.users.push(user)

        // Create trial subscription
        const trialEndsAt = new Date()
        trialEndsAt.setDate(trialEndsAt.getDate() + 7)
        store.subscriptions.push({
            id: generateId(),
            tenantId,
            plan: plan || 'BASIC',
            status: 'TRIAL',
            trialEndsAt,
            amount: 0,
            createdAt: new Date(),
        })

        const payload = { userId, tenantId, role: 'COACHING_ADMIN', email: email.toLowerCase() }
        const accessToken = signAccessToken(payload)
        const refreshToken = signRefreshToken(payload)

        return NextResponse.json({
            success: true,
            message: 'Registration successful. 7-day free trial activated!',
            accessToken,
            refreshToken,
            user: { id: userId, name, email, role: 'COACHING_ADMIN', tenantId },
            tenant: { id: tenantId, name: coachingName, themeColor: '#6366f1' },
        }, { status: 201 })
    } catch (error) {
        console.error('Register error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
