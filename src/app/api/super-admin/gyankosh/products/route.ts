import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'



export async function GET() {
    try {
        const products = await prisma.gyankoshProduct.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(products)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const product = await prisma.gyankoshProduct.create({
            data: {
                title: body.title,
                description: body.description,
                category: body.category,
                price: body.price,
                discount: body.discount,
                imageUrl: body.imageUrl,
                fileUrl: body.fileUrl,
            }
        })
        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
