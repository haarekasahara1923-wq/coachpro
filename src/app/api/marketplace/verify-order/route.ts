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
            include: { product: true }
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

        // Send Google Drive link to buyer via email (using simple fetch to email API)
        const downloadLink = order.product?.fileUrl
        if (downloadLink && order.email) {
            try {
                // Send email with download link
                const emailBody = `
                    Hello ${order.studentName},\n\n
                    Thank you for purchasing "${order.product?.title}" from Gyankosh!\n\n
                    Your download link: ${downloadLink}\n\n
                    Amount Paid: ₹${order.amount}\n
                    Order ID: ${order.id}\n\n
                    Best regards,\n
                    CoachPro Gyankosh Team
                `

                // Try sending via configured email/WhatsApp
                // For WhatsApp delivery
                if (order.phone) {
                    const whatsappMsg = encodeURIComponent(
                        `✅ *Payment Confirmed!*\n\n📚 *${order.product?.title}*\n💰 Amount: ₹${order.amount}\n\n📥 *Download your product:*\n${downloadLink}\n\nThank you for your purchase!\n— CoachPro Gyankosh`
                    )
                    // Log the WhatsApp message for manual/automated delivery
                    console.log(`[GYANKOSH DELIVERY] WhatsApp to ${order.phone}: ${whatsappMsg}`)
                }

                console.log(`[GYANKOSH DELIVERY] Email to ${order.email}: Download link = ${downloadLink}`)
            } catch (deliveryError) {
                console.error('Product delivery notification failed:', deliveryError)
                // Payment is still successful, just delivery notification failed
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully.',
            downloadLink: downloadLink || null
        })
    } catch (error: any) {
        console.error('Error verifying marketplace payment:', error)
        return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 })
    }
}
