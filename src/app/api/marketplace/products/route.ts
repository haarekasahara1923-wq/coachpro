import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const products = await prisma.gyankoshProduct.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(products)
    } catch (error) {
        console.error('Error fetching gyankosh products:', error)
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
}
