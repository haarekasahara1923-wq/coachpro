import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

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
            const tenantObj = await prisma.tenant.update({
                where: { id: order.affiliateTenantId },
                data: {
                    totalEarnings: { increment: order.commissionAmount },
                    availableBalance: { increment: order.commissionAmount }
                },
                select: { affiliateId: true, id: true }
            });

            if (tenantObj.affiliateId) {
                const now = new Date();
                const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                await prisma.affiliateMarketplaceCommission.upsert({
                    where: { orderId: dbOrderId },
                    update: {},
                    create: {
                        affiliateId: tenantObj.affiliateId,
                        tenantId: tenantObj.id,
                        orderId: dbOrderId,
                        orderAmount: order.amount,
                        commissionPercentage: 20,
                        commissionAmount: order.amount * 0.20,
                        month: monthStr,
                        status: 'PENDING'
                    }
                });
            }
        }

        // Send Google Drive link to buyer via email
        const downloadLink = order.product?.fileUrl
        if (downloadLink && order.email) {
            try {
                // Setup Nodemailer transporter using environment variables
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: Number(process.env.SMTP_PORT) || 587,
                    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });

                // Send email
                await transporter.sendMail({
                    from: process.env.EMAIL_FROM || '"CoachPro Gyankosh" <noreply@coachpro.in>',
                    to: order.email,
                    subject: `Your Purchase Details: ${order.product?.title}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #4f46e5;">Thank you for your purchase!</h2>
                            <p>Hello <strong>${order.studentName || 'Student'}</strong>,</p>
                            <p>We have successfully received your payment for <strong>"${order.product?.title}"</strong>.</p>
                            
                            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; font-size: 16px;"><strong>Amount Paid:</strong> ₹${order.amount}</p>
                                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;"><strong>Order ID:</strong> ${order.id}</p>
                            </div>

                            <p>You can access your product using the button below:</p>
                            
                            <a href="${downloadLink}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-bottom: 20px;">
                                Download / Access Product
                            </a>

                            <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
                            <p style="font-size: 14px; color: #4f46e5; word-break: break-all;">${downloadLink}</p>

                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                            <p style="font-size: 12px; color: #9ca3af;">Best regards,<br>CoachPro Gyankosh Team</p>
                        </div>
                    `
                });

                console.log(`[GYANKOSH DELIVERY] Email successfully sent to ${order.email}`);

                // For WhatsApp delivery (To be implemented later)
                if (order.phone) {
                    const whatsappMsg = encodeURIComponent(
                        `✅ *Payment Confirmed!*\n\n📚 *${order.product?.title}*\n💰 Amount: ₹${order.amount}\n\n📥 *Download your product:*\n${downloadLink}\n\nThank you for your purchase!\n— CoachPro Gyankosh`
                    )
                    // Log the WhatsApp message for manual/automated delivery
                    console.log(`[GYANKOSH DELIVERY] WhatsApp to ${order.phone}: ${whatsappMsg}`)
                }
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
