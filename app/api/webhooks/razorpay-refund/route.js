import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Return from '@/models/Return';
import crypto from 'crypto';

// Route segment config - make webhook publicly accessible
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * Webhook handler for Razorpay refund events
 * Handles: refund.processed, refund.failed, refund.speed_changed
 */
export async function POST(req) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');

        // Verify webhook signature
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        
        if (webhookSecret && signature) {
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(body)
                .digest('hex');

            if (signature !== expectedSignature) {
                console.error('Invalid webhook signature');
                return NextResponse.json(
                    { error: 'Invalid signature' },
                    { status: 400 }
                );
            }
        }

        const event = JSON.parse(body);
        
        console.log('Razorpay refund webhook received:', {
            event: event.event,
            refundId: event.payload?.refund?.entity?.id
        });

        await connectDB();

        // Handle different refund events
        switch (event.event) {
            case 'refund.processed':
                await handleRefundProcessed(event.payload.refund.entity);
                break;
            
            case 'refund.failed':
                await handleRefundFailed(event.payload.refund.entity);
                break;
            
            case 'refund.speed_changed':
                await handleRefundSpeedChanged(event.payload.refund.entity);
                break;
            
            default:
                console.log('Unhandled refund event:', event.event);
        }

        return NextResponse.json({ 
            success: true,
            message: 'Webhook processed'
        });

    } catch (error) {
        console.error('Error processing refund webhook:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Handle refund.processed event
async function handleRefundProcessed(refundData) {
    try {
        const refundId = refundData.id;
        
        const returnRequest = await Return.findOne({
            'refundDetails.refundTransactionId': refundId
        });

        if (!returnRequest) {
            console.error('Return not found for refund:', refundId);
            return;
        }

        // Update refund status
        returnRequest.refundDetails.refundStatus = 'processed';
        returnRequest.refundDetails.razorpayRefundData.status = refundData.status;
        returnRequest.refundDetails.razorpayRefundData.speed_processed = refundData.speed_processed;

        // Add admin note
        returnRequest.adminNotes.push({
            note: `Refund processed successfully by Razorpay - Refund ID: ${refundId}`,
            addedAt: new Date()
        });

        // Update to completed status if refund is processed
        if (returnRequest.status === 'refund_processed') {
            await returnRequest.updateStatus('completed', null, 
                'Refund completed and confirmed by Razorpay');
            returnRequest.completedAt = new Date();
        }

        await returnRequest.save();

        console.log('Refund processed webhook handled:', {
            returnId: returnRequest._id,
            refundId,
            status: refundData.status
        });

    } catch (error) {
        console.error('Error handling refund.processed:', error);
        throw error;
    }
}

// Handle refund.failed event
async function handleRefundFailed(refundData) {
    try {
        const refundId = refundData.id;
        
        const returnRequest = await Return.findOne({
            'refundDetails.refundTransactionId': refundId
        });

        if (!returnRequest) {
            console.error('Return not found for refund:', refundId);
            return;
        }

        // Update refund status to failed
        returnRequest.refundDetails.refundStatus = 'failed';
        returnRequest.refundDetails.razorpayRefundData.status = refundData.status;

        // Add admin note with error details
        returnRequest.adminNotes.push({
            note: `Refund failed - Refund ID: ${refundId}. Reason: ${refundData.error_description || 'Unknown'}`,
            addedAt: new Date()
        });

        // Revert status to approved_refund so it can be reprocessed
        await returnRequest.updateStatus('approved_refund', null, 
            `Refund failed and needs reprocessing: ${refundData.error_description || 'Unknown error'}`);

        await returnRequest.save();

        console.log('Refund failed webhook handled:', {
            returnId: returnRequest._id,
            refundId,
            error: refundData.error_description
        });

    } catch (error) {
        console.error('Error handling refund.failed:', error);
        throw error;
    }
}

// Handle refund.speed_changed event
async function handleRefundSpeedChanged(refundData) {
    try {
        const refundId = refundData.id;
        
        const returnRequest = await Return.findOne({
            'refundDetails.refundTransactionId': refundId
        });

        if (!returnRequest) {
            console.error('Return not found for refund:', refundId);
            return;
        }

        // Update refund speed
        returnRequest.refundDetails.razorpayRefundData.speed_processed = refundData.speed_processed;

        // Add admin note
        returnRequest.adminNotes.push({
            note: `Refund speed changed to: ${refundData.speed_processed}`,
            addedAt: new Date()
        });

        await returnRequest.save();

        console.log('Refund speed changed webhook handled:', {
            returnId: returnRequest._id,
            refundId,
            newSpeed: refundData.speed_processed
        });

    } catch (error) {
        console.error('Error handling refund.speed_changed:', error);
        throw error;
    }
}
