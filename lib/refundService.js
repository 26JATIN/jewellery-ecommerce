import { processRefund, getRefundStatus } from './razorpay.js';
import Order from '@/models/Order';
import Return from '@/models/Return';
import { inventoryService } from './inventoryService.js';

/**
 * Automatic refund processing service
 * Handles refund workflow when return items are inspected and approved
 */

/**
 * Process automatic refund after warehouse inspection
 * @param {string} returnId - Return request ID
 * @param {string} userId - Admin user ID who approved the refund
 * @returns {Promise<object>} Refund result
 */
export const processAutomaticRefund = async (returnId, userId) => {
    try {
        // Find the return request
        const returnRequest = await Return.findById(returnId).populate('order');
        
        if (!returnRequest) {
            throw new Error('Return request not found');
        }

        // Validate return status
        if (returnRequest.status !== 'approved_refund') {
            throw new Error(`Cannot process refund for return in status: ${returnRequest.status}`);
        }

        // Check if refund already processed
        if (returnRequest.refundDetails?.refundTransactionId) {
            throw new Error('Refund already processed for this return');
        }

        const order = returnRequest.order;
        
        // Validate order has payment information
        if (!order.payment?.id) {
            throw new Error('Order does not have payment information');
        }

        if (order.payment.status !== 'completed') {
            throw new Error('Cannot refund - original payment not completed');
        }

        // Calculate refund amount
        const refundAmount = returnRequest.refundDetails?.refundAmount || 
                            returnRequest.refundDetails?.originalAmount;

        if (!refundAmount || refundAmount <= 0) {
            throw new Error('Invalid refund amount');
        }

        // Validate refund amount doesn't exceed order total
        if (refundAmount > order.totalAmount) {
            throw new Error('Refund amount cannot exceed order total');
        }

        console.log(`Processing automatic refund for return ${returnRequest.returnNumber}`, {
            orderId: order._id,
            paymentId: order.payment.id,
            refundAmount,
            returnStatus: returnRequest.status
        });

        // Process refund through Razorpay
        const razorpayRefund = await processRefund(
            order.payment.id,
            refundAmount,
            {
                speed: 'normal',
                notes: {
                    return_number: returnRequest.returnNumber,
                    order_number: order.orderNumber || order._id.toString(),
                    return_id: returnId,
                    processed_by: userId
                },
                receipt: `refund_${returnRequest.returnNumber}_${Date.now()}`
            }
        );

        // Update return request with refund details
        returnRequest.refundDetails.refundProcessedAt = new Date();
        returnRequest.refundDetails.refundTransactionId = razorpayRefund.id;
        returnRequest.refundDetails.refundStatus = razorpayRefund.status;
        returnRequest.refundDetails.razorpayRefundData = {
            id: razorpayRefund.id,
            entity: razorpayRefund.entity,
            amount: razorpayRefund.amount / 100,
            currency: razorpayRefund.currency,
            payment_id: razorpayRefund.payment_id,
            status: razorpayRefund.status,
            speed_requested: razorpayRefund.speed_requested,
            speed_processed: razorpayRefund.speed_processed,
            created_at: razorpayRefund.created_at
        };

        // Update status to refund_processed
        await returnRequest.updateStatus('refund_processed', userId, 
            `Automatic refund processed - Razorpay Refund ID: ${razorpayRefund.id}`);

        await returnRequest.save();

        // Update order status if full refund
        if (refundAmount >= order.totalAmount) {
            order.status = 'refunded';
            order.refundDetails = {
                refundAmount,
                refundDate: new Date(),
                refundMethod: 'original_payment',
                refundReason: 'Return approved and processed',
                refundType: 'automatic',
                razorpayRefundId: razorpayRefund.id,
                returnId: returnId
            };
            await order.save();
        }

        // Restore inventory - refund successful, items back in stock
        try {
            console.log(`📦 Restoring inventory for refunded order ${order.orderNumber}...`);
            const inventoryResult = await inventoryService.restoreInventory(
                order._id, 
                'refund_successful'
            );
            console.log(`✅ Inventory restored: ${inventoryResult.totalItemsRestored} items returned to stock`);
        } catch (inventoryError) {
            console.error('⚠️  Failed to restore inventory after refund:', inventoryError);
            // Log but don't fail the refund process
            returnRequest.adminNotes.push({
                note: `Warning: Inventory restoration failed after refund - ${inventoryError.message}. Please manually update stock.`,
                addedBy: userId,
                addedAt: new Date()
            });
            await returnRequest.save();
        }

        console.log(`Automatic refund processed successfully:`, {
            returnId,
            refundId: razorpayRefund.id,
            amount: refundAmount,
            status: razorpayRefund.status
        });

        return {
            success: true,
            refundId: razorpayRefund.id,
            amount: refundAmount,
            status: razorpayRefund.status,
            returnRequest,
            order
        };

    } catch (error) {
        console.error('Automatic refund processing failed:', {
            returnId,
            error: error.message,
            stack: error.stack
        });

        // Log failure in return request
        try {
            const returnRequest = await Return.findById(returnId);
            if (returnRequest) {
                returnRequest.adminNotes.push({
                    note: `Automatic refund failed: ${error.message}`,
                    addedBy: userId,
                    addedAt: new Date()
                });
                await returnRequest.save();
            }
        } catch (logError) {
            console.error('Failed to log refund error:', logError);
        }

        throw error;
    }
};

/**
 * Check and update refund status from Razorpay
 * @param {string} returnId - Return request ID
 * @returns {Promise<object>} Updated refund status
 */
export const checkRefundStatus = async (returnId) => {
    try {
        const returnRequest = await Return.findById(returnId);
        
        if (!returnRequest) {
            throw new Error('Return request not found');
        }

        const refundId = returnRequest.refundDetails?.refundTransactionId;
        
        if (!refundId) {
            throw new Error('No refund transaction found for this return');
        }

        // Fetch current status from Razorpay
        const refundStatus = await getRefundStatus(refundId);

        // Update local refund status
        if (returnRequest.refundDetails.refundStatus !== refundStatus.status) {
            returnRequest.refundDetails.refundStatus = refundStatus.status;
            returnRequest.refundDetails.razorpayRefundData.status = refundStatus.status;
            returnRequest.refundDetails.razorpayRefundData.speed_processed = refundStatus.speed_processed;
            
            returnRequest.adminNotes.push({
                note: `Refund status updated to: ${refundStatus.status}`,
                addedAt: new Date()
            });

            await returnRequest.save();
        }

        return {
            success: true,
            refundId,
            status: refundStatus.status,
            amount: refundStatus.amount / 100,
            updatedAt: new Date()
        };

    } catch (error) {
        console.error('Failed to check refund status:', error);
        throw error;
    }
};

/**
 * Process refund for inspected and approved returns
 * Called automatically when return status changes to 'approved_refund'
 * @param {object} returnRequest - Return request document
 * @param {string} userId - Admin user ID
 * @returns {Promise<object>} Refund result
 */
export const handleApprovedRefund = async (returnRequest, userId) => {
    try {
        // Check if auto-refund is enabled (can be added to config later)
        const autoRefundEnabled = process.env.AUTO_REFUND_ENABLED !== 'false';

        if (!autoRefundEnabled) {
            console.log('Auto-refund disabled, skipping automatic processing');
            return {
                success: false,
                message: 'Auto-refund is disabled',
                requiresManualProcessing: true
            };
        }

        console.log(`Auto-processing refund for approved return: ${returnRequest.returnNumber}`);
        
        const result = await processAutomaticRefund(returnRequest._id.toString(), userId);
        
        return result;

    } catch (error) {
        console.error('Failed to handle approved refund:', error);
        
        // Don't throw error - allow manual processing as fallback
        return {
            success: false,
            error: error.message,
            requiresManualProcessing: true
        };
    }
};

export default {
    processAutomaticRefund,
    checkRefundStatus,
    handleApprovedRefund
};
