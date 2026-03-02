import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/api/middleware'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    try {
        const body = await req.json()
        const { amount, plan } = body

        if (!amount || !plan) {
            return NextResponse.json({ error: 'Amount and plan are required' }, { status: 400 })
        }

        const options = {
            amount: parseInt(amount) * 100, // amount in smallest currency unit (paise)
            currency: 'INR',
            receipt: `receipt_${user!.userId}_${Date.now()}`,
            notes: {
                userId: user!.userId,
                tenantId: user!.tenantId,
                plan: plan,
            }
        }

        const order = await razorpay.orders.create(options)

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        })
    } catch (err: any) {
        console.error('Razorpay Create Order Error:', err)
        return NextResponse.json({ error: 'Failed to create Razorpay Order' }, { status: 500 })
    }
}
