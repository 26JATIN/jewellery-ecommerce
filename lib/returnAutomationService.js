import connectDB from './mongodb.js';
import Return from '../models/Return.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { reversePickupService } from './reversePickupService.js';
import logger from './logger.js';

/**
 * Return Automation Service
 * Automatically approves returns and schedules pickups
 */

class ReturnAutomationService {
    constructor() {
        this.autoApprovalEnabled = process.env.AUTO_APPROVE_RETURNS !== 'false';
        this.autoPickupEnabled = process.env.AUTO_SCHEDULE_PICKUP !== 'false';
    }

    /**
     * Process a newly created return request
     * Auto-approves and schedules pickup
     */
    async processNewReturn(returnId) {
        try {
            await connectDB();

            const returnRequest = await Return.findById(returnId)
                .populate('order')
                .populate('user', 'name email');

            if (!returnRequest) {
                logger.error(`Return ${returnId} not found`);
                return { success: false, error: 'Return not found' };
            }

            logger.info(`🔄 Processing new return: ${returnId}`);

            // Step 1: Auto-approve the return
            if (this.autoApprovalEnabled && returnRequest.status === 'requested') {
                await this.autoApproveReturn(returnRequest);
            }

            // Step 2: Auto-schedule pickup
            if (this.autoPickupEnabled && returnRequest.status === 'approved') {
                await this.autoSchedulePickup(returnRequest);
            }

            return { success: true, returnRequest };

        } catch (error) {
            logger.error(`Error processing return ${returnId}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Automatically approve a return request
     */
    async autoApproveReturn(returnRequest) {
        try {
            logger.info(`✅ Auto-approving return: ${returnRequest._id}`);

            // Update return status to approved
            await returnRequest.updateStatus(
                'approved',
                null,
                '🤖 Automatically approved - Meets return policy criteria'
            );

            // Add admin note
            returnRequest.adminNotes.push({
                note: '🤖 Return automatically approved by system - within return window and meets eligibility criteria',
                addedAt: new Date()
            });

            // Set admin response
            returnRequest.adminResponse = 'Your return has been automatically approved. A pickup will be scheduled shortly.';
            returnRequest.approvedAt = new Date();

            await returnRequest.save();

            logger.info(`✅ Return ${returnRequest._id} auto-approved successfully`);

            return true;

        } catch (error) {
            logger.error(`Error auto-approving return ${returnRequest._id}:`, error);
            throw error;
        }
    }

    /**
     * Automatically schedule pickup for approved return
     */
    async autoSchedulePickup(returnRequest) {
        try {
            logger.info(`📦 Auto-scheduling pickup for return: ${returnRequest._id}`);

            // Check if pickup already scheduled
            if (returnRequest.pickup?.pickupStatus === 'scheduled') {
                logger.info(`⏭️  Pickup already scheduled for return: ${returnRequest._id}`);
                return true;
            }

            // Schedule pickup using reverse pickup service
            const pickupResult = await reversePickupService.automateReversePickup(returnRequest._id);

            if (pickupResult.success) {
                // Reload the return to get updated data
                await returnRequest.reload();
                
                if (pickupResult.fullyAutomated) {
                    // Fully automated - courier assigned and pickup scheduled
                    logger.info(`✅ Pickup fully automated for return: ${returnRequest._id} - AWB: ${pickupResult.awbCode}`);
                    
                    returnRequest.adminNotes.push({
                        note: `🤖 Pickup fully automated - Shipment: ${pickupResult.shipmentId}, AWB: ${pickupResult.awbCode}, Courier: ${pickupResult.courier}`,
                        addedAt: new Date()
                    });
                } else if (pickupResult.requiresManualCourier) {
                    // Partially automated - shipment created but courier needs manual selection
                    logger.warn(`⚠️  Pickup partially automated for return: ${returnRequest._id} - Requires manual courier selection`);
                    
                    returnRequest.adminNotes.push({
                        note: `🤖 Reverse pickup shipment created (ID: ${pickupResult.shipmentId}). ⚠️ Please assign courier manually on Shiprocket dashboard.`,
                        addedAt: new Date()
                    });
                    
                    returnRequest.adminResponse = 'Your return has been approved. We are scheduling the pickup - you will receive tracking details shortly.';
                }

                await returnRequest.save();
                return true;
            } else {
                logger.error(`❌ Failed to schedule pickup for return ${returnRequest._id}:`, pickupResult.error);
                
                // Add failure note
                returnRequest.adminNotes.push({
                    note: `❌ Automatic pickup scheduling failed: ${pickupResult.error}. Requires manual intervention.`,
                    addedAt: new Date()
                });
                
                await returnRequest.save();
                return false;
            }

        } catch (error) {
            logger.error(`Error scheduling pickup for return ${returnRequest._id}:`, error);
            
            // Add error note
            try {
                returnRequest.adminNotes.push({
                    note: `❌ Pickup scheduling error: ${error.message}. Requires manual scheduling.`,
                    addedAt: new Date()
                });
                await returnRequest.save();
            } catch (noteError) {
                logger.error('Failed to add error note:', noteError);
            }
            
            // Don't throw - pickup scheduling failure shouldn't block return approval
            return false;
        }
    }

    /**
     * Check and process pending returns that need automation
     */
    async processPendingReturns() {
        try {
            await connectDB();

            // Find returns that are requested but not yet approved
            const pendingReturns = await Return.find({
                status: 'requested',
                'eligibility.isEligible': true
            }).limit(50);

            logger.info(`📋 Found ${pendingReturns.length} pending returns to process`);

            for (const returnRequest of pendingReturns) {
                await this.processNewReturn(returnRequest._id);
            }

            // Find approved returns without pickup scheduled
            const approvedWithoutPickup = await Return.find({
                status: 'approved',
                'pickup.pickupStatus': { $in: ['pending', null] }
            }).limit(50);

            logger.info(`📦 Found ${approvedWithoutPickup.length} approved returns without pickup`);

            for (const returnRequest of approvedWithoutPickup) {
                await this.autoSchedulePickup(returnRequest);
            }

            return {
                processed: pendingReturns.length,
                pickupsScheduled: approvedWithoutPickup.length
            };

        } catch (error) {
            logger.error('Error processing pending returns:', error);
            throw error;
        }
    }
}

export const returnAutomationService = new ReturnAutomationService();
export default returnAutomationService;
