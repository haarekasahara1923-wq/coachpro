import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
})

export async function POST(req: Request) {
    try {
        const { productId, studentName, email, phone, affiliateTenantId, orderBumpIds } = await req.json()

        // Retrieve Product
        const product = await prisma.gyankoshProduct.findUnique({
            where: { id: productId },
            include: { orderBumps: true }
        })

        if (!product || !product.isActive) {
            return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 })
        }

        const mainPrice = product.price - (product.price * (product.discount / 100))
        
        // Calculate total for bumps
        let bumpsTotal = 0
        const actualBumpIds: string[] = []
        
        if (orderBumpIds && orderBumpIds.length > 0) {
            const selectedBumps = product.orderBumps.filter(b => orderBumpIds.includes(b.id))
            bumpsTotal = selectedBumps.reduce((sum, b) => sum + b.discountedPrice, 0)
            selectedBumps.forEach(b => actualBumpIds.push(b.id))
        }

        const finalTotal = mainPrice + bumpsTotal
        const amountInPaise = Math.round(finalTotal * 100)

        // Verify affiliate
        let validAffiliateId = null
        if (affiliateTenantId) {
            const coaching = await prisma.tenant.findUnique({
                where: { id: affiliateTenantId }
            })
            if (coaching) validAffiliateId = coaching.id
        }

        // Commission (20%)
        const commissionAmount = validAffiliateId ? (finalTotal * 0.20) : 0

        // Create Razorpay Order
        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `gyankosh_${Date.now()}`,
        }

        const rzpOrder = await razorpay.orders.create(options)

        // Create record in DB
        const order = await prisma.gyankoshOrder.create({
            data: {
                productId,
                orderBumpIds: actualBumpIds,
                studentName,
                email,
                phone,
                amount: finalTotal,
                status: 'PENDING',
                razorpayOrderId: rzpOrder.id,
                affiliateTenantId: validAffiliateId,
                commissionAmount: commissionAmount,
            }
        })

        return NextResponse.json({
            orderId: rzpOrder.id,
            amount: amountInPaise,
            currency: rzpOrder.currency,
            dbOrderId: order.id,
        })

    } catch (error: any) {
        console.error('Error creating marketplace order:', error)
        return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 })
    }
}
