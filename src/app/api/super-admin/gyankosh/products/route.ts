import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'

function getUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return null
    return verifyAccessToken(authHeader.split(' ')[1])
}

export async function GET(req: NextRequest) {
    try {
        const user = getUser(req)
        if (!user || user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const products = await prisma.gyankoshProduct.findMany({ orderBy: { createdAt: 'desc' } })

        const orders = await prisma.gyankoshOrder.findMany({
            where: { status: 'SUCCESS' },
            include: { product: true },
            orderBy: { createdAt: 'desc' },
            take: 50
        })

        return NextResponse.json({ products, orders })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUser(req)
        if (!user || user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const body = await req.json()
        const product = await prisma.gyankoshProduct.create({
            data: {
                title: body.title,
                description: body.description,
                category: body.category,
                price: body.price,
                discount: body.discount || 0,
                imageUrl: body.imageUrl || '',
                fileUrl: body.fileUrl || '', // Google Drive download link
            }
        })
        return NextResponse.json(product)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const user = getUser(req)
        if (!user || user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const body = await req.json()
        if (body.action === 'toggle') {
            const product = await prisma.gyankoshProduct.update({
                where: { id: body.id },
                data: { isActive: !body.isActive }
            })
            return NextResponse.json(product)
        }

        if (body.action === 'edit') {
            const product = await prisma.gyankoshProduct.update({
                where: { id: body.id },
                data: {
                    title: body.title,
                    description: body.description,
                    category: body.category,
                    price: body.price,
                    discount: body.discount || 0,
                    imageUrl: body.imageUrl || '',
                    fileUrl: body.fileUrl || '',
                }
            })
            return NextResponse.json(product)
        }

        return NextResponse.json({ error: 'Invalid' }, { status: 400 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
