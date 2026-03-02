import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/api/middleware'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json()

        const sign = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(sign.toString())
            .digest("hex")

        if (razorpay_signature === expectedSign) {
            // Update subscription in DB
            await prisma.subscription.update({
                where: { tenantId: user!.tenantId },
                data: {
                    plan: plan.toUpperCase(),
                    status: 'ACTIVE',
                    razorpaySubId: razorpay_payment_id,
                    updatedAt: new Date()
                }
            })
            return NextResponse.json({ success: true, message: 'Payment verified successfully' })
        } else {
            return NextResponse.json({ success: false, error: 'Invalid signature sent!' }, { status: 400 })
        }
    } catch (err: any) {
        console.error('Razorpay Verify Order Error:', err)
        return NextResponse.json({ error: 'Internal server error validating payment' }, { status: 500 })
    }
}
