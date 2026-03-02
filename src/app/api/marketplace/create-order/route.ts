import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Razorpay from 'razorpay'



const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
})

export async function POST(req: Request) {
    try {
        const { productId, studentName, email, phone, affiliateTenantId } = await req.json()

        // Retrieve Product to calculate correct amount
        const product = await prisma.gyankoshProduct.findUnique({
            where: { id: productId }
        })

        if (!product || !product.isActive) {
            return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 })
        }

        const finalPrice = product.price - (product.price * (product.discount / 100))
        const amountInPaise = Math.round(finalPrice * 100)

        // Verify affiliate (optional)
        let validAffiliateId = null
        if (affiliateTenantId) {
            const coaching = await prisma.tenant.findUnique({
                where: { id: affiliateTenantId }
            })
            if (coaching) {
                validAffiliateId = coaching.id
            }
        }

        // Commission logic (20% of finalPrice)
        const commissionAmount = validAffiliateId ? (finalPrice * 0.20) : 0

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
                studentName,
                email,
                phone,
                amount: finalPrice,
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
