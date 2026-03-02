import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signAccessToken, signRefreshToken } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, phone, coachingName, plan } = await req.json()

        if (!name || !email || !password || !coachingName) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        // Check if email already exists
        const existingUser = await prisma.user.findFirst({ where: { email: email.toLowerCase() } })
        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
        }

        let tenantSlug = slugify(coachingName)
        let slugExists = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
        let count = 1
        while (slugExists) {
            tenantSlug = `${slugify(coachingName)}-${count}`
            slugExists = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
            count++
        }

        const hashedPassword = await hashPassword(password)
        const trialEndsAt = new Date()
        trialEndsAt.setDate(trialEndsAt.getDate() + 7)

        const result = await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: coachingName,
                    slug: tenantSlug,
                    themeColor: '#6366f1',
                    phone: phone || '',
                    email: email,
                    isActive: true,
                }
            })

            const user = await tx.user.create({
                data: {
                    tenantId: tenant.id,
                    email: email.toLowerCase(),
                    phone: phone || '',
                    password: hashedPassword,
                    name,
                    role: 'COACHING_ADMIN',
                    isActive: true,
                }
            })

            const subscription = await tx.subscription.create({
                data: {
                    tenantId: tenant.id,
                    plan: plan || 'BASIC',
                    status: 'TRIAL',
                    trialEndsAt,
                    amount: 0,
                }
            })

            return { tenant, user, subscription }
        })

        const payload = { userId: result.user.id, tenantId: result.tenant.id, role: 'COACHING_ADMIN', email: email.toLowerCase() }
        const accessToken = signAccessToken(payload)
        const refreshToken = signRefreshToken(payload)

        return NextResponse.json({
            success: true,
            message: 'Registration successful. 7-day free trial activated!',
            accessToken,
            refreshToken,
            user: { id: result.user.id, name, email, role: 'COACHING_ADMIN', tenantId: result.tenant.id },
            tenant: { id: result.tenant.id, name: coachingName, themeColor: '#6366f1' },
        }, { status: 201 })
    } catch (error) {
        console.error('Register error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
