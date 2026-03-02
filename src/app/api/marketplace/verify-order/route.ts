import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'



export async function POST(req: Request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = await req.json()

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body.toString())
            .digest('hex')

        const isAuthentic = expectedSignature === razorpay_signature

        if (!isAuthentic) {
            // Mark as failed
            await prisma.gyankoshOrder.update({
                where: { id: dbOrderId },
                data: { status: 'FAILED' }
            })
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
        }

        // Mark Order as SUCCESS
        const order = await prisma.gyankoshOrder.update({
            where: { id: dbOrderId },
            data: {
                status: 'SUCCESS',
                razorpayPaymentId: razorpay_payment_id
            },
        })

        // Process affiliate commission
        if (order.affiliateTenantId && order.commissionAmount > 0) {
            await prisma.tenant.update({
                where: { id: order.affiliateTenantId },
                data: {
                    totalEarnings: { increment: order.commissionAmount },
                    availableBalance: { increment: order.commissionAmount }
                }
            })
        }

        // Return success to frontend
        return NextResponse.json({ success: true, message: 'Payment verified successfully.' })
    } catch (error: any) {
        console.error('Error verifying marketplace payment:', error)
        return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 })
    }
}
