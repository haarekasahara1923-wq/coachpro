import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { store } from '@/lib/store'

export function getAuthUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return null
    }
    const token = authHeader.split(' ')[1]
    return verifyAccessToken(token)
}

export function requireAuth(req: NextRequest) {
    const user = getAuthUser(req)
    if (!user) {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null }
    }
    return { error: null, user }
}

export function requireRole(req: NextRequest, roles: string[]) {
    const { error, user } = requireAuth(req)
    if (error) return { error, user: null }
    if (!roles.includes(user!.role)) {
        return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), user: null }
    }
    return { error: null, user }
}
