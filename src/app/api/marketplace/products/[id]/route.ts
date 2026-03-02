import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const product = await prisma.gyankoshProduct.findUnique({
            where: { id, isActive: true },
        })

        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

        return NextResponse.json(product)
    } catch (error) {
        console.error('Error fetching product:', error)
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
    }
}
