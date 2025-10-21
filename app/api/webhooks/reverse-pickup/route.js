import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Return from '@/models/Return';
import Order from '@/models/Order';
import { processAutomaticRefund } from '@/lib/refundService';

// Route segment config - make webhook publicly accessible
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// CORS headers for webhook accessibility
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, anx-api-key, Authorization',
    'Content-Type': 'application/json',
};

/**
 * AUTOMATED RETURN WORKFLOW WEBHOOK
 * 
 * ⚠️ IMPORTANT: Shiprocket Webhook Requirements
 * - URL must NOT contain: "shiprocket", "kartrocket", "sr", "kr", "return", "tracking"
 * - Content-Type header: application/json
 * - Security token header: anx-api-key
 * - Must always return HTTP 200 (even for errors)
 * 
 * Webhook URL: https://www.nandikajewellers.in/api/webhooks/reverse-pickup
 * 
 * This webhook handles the complete automated return process:
 * 1. User requests return → Status: 'requested'
 * 2. Admin approval (automatic for valid returns) → Status: 'approved'
 * 3. Shiprocket pickup scheduling (automatic) → Status: 'pickup_scheduled'
 * 4. Shiprocket webhook: Item picked up → Status: 'picked_up'
 * 5. Shiprocket webhook: In transit → Status: 'in_transit'
 * 6. Shiprocket webhook: Delivered to warehouse → Status: 'received'
 * 7. Inspection (can be automated based on condition) → Status: 'inspected'
 * 8. Automatic refund trigger → Status: 'refund_processed'
 * 9. Refund completed → Status: 'completed'
 */

// Verify webhook signature
function verifyWebhookSignature(payload, signature, secret) {
    if (!secret) {
        console.warn('⚠️  SHIPROCKET_WEBHOOK_SECRET not configured - skipping verification in development');
        return true;
    }
    
    if (!signature) {
        return false;
    }
    
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

/**
 * OPTIONS endpoint for CORS preflight
 */
export async function OPTIONS(req) {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders
    });
}

/**
 * Automated Return Webhook Handler
 * Processes Shiprocket status updates for return shipments
 */
export async function POST(req) {
    try {
        const webhookData = await req.json();
        console.log('🔄 Return Webhook received:', JSON.stringify(webhookData, null, 2));

        // Verify webhook authenticity using anx-api-key
        const apiKey = req.headers.get('anx-api-key');
        const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;
        
        if (!verifyWebhookSignature(webhookData, apiKey, webhookSecret)) {
            console.error('❌ Invalid webhook API key for return');
            // Still return 200 as per Shiprocket requirement
            return NextResponse.json(
                { success: false, message: 'Invalid API key' },
                { status: 200, headers: corsHeaders }
            );
        }
        
        console.log('✅ Return webhook API key verified');
        
        // Extract webhook data (matching Shiprocket's actual format)
        const {
            awb,
            courier_name,
            current_status,
            current_status_id,
            shipment_status,
            shipment_status_id,
            current_timestamp,
            order_id,
            sr_order_id,
            awb_assigned_date,
            pickup_scheduled_date,
            etd,
            scans = [],
            is_return,
            channel_id,
            pod_status,
            pod
        } = webhookData;

        // Use shipment_status_id as the primary status indicator
        const statusCode = shipment_status_id || current_status_id;
        const statusLabel = shipment_status || current_status;

        if (!awb && !sr_order_id) {
            // Return 200 as per Shiprocket requirement
            return NextResponse.json(
                { success: false, message: 'AWB or SR Order ID required' },
                { status: 200, headers: corsHeaders }
            );
        }

        await connectDB();

        // Find return by AWB code or Shiprocket order ID
        let returnRequest;
        if (awb) {
            returnRequest = await Return.findOne({ 'pickup.awbCode': awb })
                .populate('order')
                .populate('user');
        }
        if (!returnRequest && sr_order_id) {
            returnRequest = await Return.findOne({ 'pickup.shiprocketOrderId': sr_order_id })
                .populate('order')
                .populate('user');
        }

        if (!returnRequest) {
            console.log(`Return not found for AWB: ${awb}, SR Order ID: ${sr_order_id}`);
            // Return 200 as per Shiprocket requirement
            return NextResponse.json(
                { success: false, message: 'Return not found' },
                { status: 200, headers: corsHeaders }
            );
        }

        console.log(`📋 Processing return ${returnRequest.returnNumber} (${returnRequest._id})`);

        /**
         * AUTOMATED STATUS MAPPING FOR RETURN WORKFLOW
         * (Using Shiprocket's actual status IDs)
         */
        const returnStatusMapping = {
            // Initial/Processing phase
            1: { returnStatus: 'approved', pickupStatus: 'pending', action: 'update', automate: true },           // New
            2: { returnStatus: 'pickup_scheduled', pickupStatus: 'scheduled', action: 'update', automate: true }, // Pickup Scheduled
            3: { returnStatus: 'pickup_scheduled', pickupStatus: 'scheduled', action: 'update', automate: true }, // AWB Assigned
            4: { returnStatus: 'pickup_scheduled', pickupStatus: 'scheduled', action: 'update', automate: true }, // Pickup Generated
            5: { returnStatus: 'pickup_scheduled', pickupStatus: 'scheduled', action: 'update', automate: true }, // Manifest Generated
            13: { returnStatus: 'pickup_scheduled', pickupStatus: 'scheduled', action: 'update', automate: true },// Out For Pickup
            
            // Transit phase
            6: { returnStatus: 'picked_up', pickupStatus: 'completed', action: 'update', automate: true },        // Shipped (actually picked up for returns)
            42: { returnStatus: 'picked_up', pickupStatus: 'completed', action: 'update', automate: true },       // Picked Up
            18: { returnStatus: 'in_transit', pickupStatus: 'completed', action: 'update', automate: true },      // In Transit
            19: { returnStatus: 'in_transit', pickupStatus: 'completed', action: 'update', automate: true },      // Out For Delivery
            38: { returnStatus: 'in_transit', pickupStatus: 'completed', action: 'update', automate: true },      // Reached Destination Hub
            
            // Delivery to warehouse
            7: { returnStatus: 'received', pickupStatus: 'completed', action: 'trigger_inspection', automate: true }, // Delivered
            
            // Failed scenarios
            9: { returnStatus: 'pickup_failed', pickupStatus: 'failed', action: 'notify_admin', automate: false },     // RTO Initiated
            10: { returnStatus: 'pickup_failed', pickupStatus: 'failed', action: 'notify_admin', automate: false },    // RTO Delivered
            11: { returnStatus: 'pickup_failed', pickupStatus: 'failed', action: 'notify_admin', automate: false },    // Lost
            12: { returnStatus: 'pickup_failed', pickupStatus: 'failed', action: 'notify_admin', automate: false },    // Damaged
            15: { returnStatus: 'pickup_failed', pickupStatus: 'failed', action: 'notify_admin', automate: false },    // Undelivered
            21: { returnStatus: 'pickup_failed', pickupStatus: 'failed', action: 'notify_admin', automate: false },    // Unsuccessfully Delivered
        };

        const statusAction = returnStatusMapping[statusCode];

        if (!statusAction) {
            console.log(`⚠️  Unmapped status code ${current_status_code}: ${current_status}`);
            // Update tracking info but don't change status
            statusAction = { action: 'update', automate: true };
        }

        // Prepare update data for tracking
        const updateData = {
            'pickup.currentLocation': location || current_status,
            'pickup.lastUpdateAt': new Date(current_timestamp || Date.now())
        };

        if (courier_name) {
            updateData['pickup.courier'] = courier_name;
        }

        if (delivered_date && current_status_code === 6) {
            updateData['pickup.deliveredToWarehouse'] = new Date(delivered_date);
        }

        if (pickup_scheduled_date && [2, 13].includes(current_status_code)) {
            updateData['pickup.scheduledDate'] = new Date(pickup_scheduled_date);
        }

        // Update pickup status if mapped
        if (statusAction?.pickupStatus) {
            updateData['pickup.pickupStatus'] = statusAction.pickupStatus;
        }

        // Add to tracking history
        const trackingEntry = {
            activity: current_status,
            location: location,
            timestamp: new Date(current_timestamp || Date.now()),
            statusCode: current_status_code?.toString()
        };

        const existingEntry = returnRequest.pickup.trackingHistory?.find(
            entry => entry.timestamp.getTime() === trackingEntry.timestamp.getTime() &&
                    entry.statusCode === trackingEntry.statusCode
        );

        if (!existingEntry) {
            if (!updateData['$push']) {
                updateData['$push'] = {};
            }
            updateData['$push']['pickup.trackingHistory'] = trackingEntry;
        }

        // Update the return request with tracking data
        await Return.findByIdAndUpdate(returnRequest._id, updateData);

        /**
         * AUTOMATED WORKFLOW ACTIONS
         */
        let workflowMessage = `Tracking updated: ${statusLabel}`;
        let triggeredAutomation = null;

        if (statusAction?.automate && statusAction.returnStatus) {
            // Check if status change is needed
            if (returnRequest.status !== statusAction.returnStatus) {
                console.log(`🤖 Automating status change: ${returnRequest.status} → ${statusAction.returnStatus}`);
                
                // Update status via the model method to trigger any hooks
                await returnRequest.updateStatus(
                    statusAction.returnStatus,
                    'system_automation',
                    `Automated update from Shiprocket: ${statusLabel}`
                );

                workflowMessage = `Status automatically updated to ${statusAction.returnStatus}`;

                // TRIGGER AUTOMATED ACTIONS BASED ON NEW STATUS
                switch (statusAction.returnStatus) {
                    case 'received':
                        // Item received at warehouse - trigger automatic inspection
                        console.log('📦 Item received at warehouse - triggering automated inspection');
                        
                        // Auto-approve inspection if condition is not 'damaged' or 'defective'
                        const allItemsGoodCondition = returnRequest.items.every(item =>
                            ['unused', 'lightly_used'].includes(item.itemCondition)
                        );

                        if (allItemsGoodCondition) {
                            console.log('✅ Auto-approving inspection - all items in good condition');
                            
                            // Update to inspected and approved_refund
                            await returnRequest.updateStatus(
                                'inspected',
                                'system_automation',
                                'Automated inspection passed - items in good condition'
                            );

                            // Immediately approve refund
                            await returnRequest.updateStatus(
                                'approved_refund',
                                'system_automation',
                                'Refund automatically approved after successful inspection'
                            );

                            // Trigger automatic refund processing
                            triggeredAutomation = 'refund_triggered';
                            workflowMessage = 'Inspection passed and refund triggered automatically';

                            // Process refund
                            try {
                                console.log('💰 Processing automated refund...');
                                await processAutomaticRefund(returnRequest._id, 'system_automation');
                                
                                // Update to completed
                                await returnRequest.updateStatus(
                                    'completed',
                                    'system_automation',
                                    'Return process completed automatically'
                                );

                                console.log('🎉 Automated return workflow completed successfully!');
                                workflowMessage = 'Return completed automatically - refund processed';
                                triggeredAutomation = 'return_completed';

                            } catch (refundError) {
                                console.error('❌ Automated refund failed:', refundError);
                                // Don't fail the webhook, but log for manual review
                                workflowMessage = 'Inspection passed but refund failed - manual review needed';
                            }
                        } else {
                            console.log('⚠️  Manual inspection required - items flagged as damaged/defective');
                            await returnRequest.updateStatus(
                                'inspected',
                                'system_automation',
                                'Items require manual inspection due to condition'
                            );
                            workflowMessage = 'Manual inspection required';
                        }
                        break;

                    case 'picked_up':
                        console.log('🚚 Item picked up - in transit to warehouse');
                        workflowMessage = 'Item picked up by courier';
                        break;

                    case 'in_transit':
                        console.log('📍 Item in transit to warehouse');
                        workflowMessage = 'Item in transit';
                        break;

                    case 'pickup_failed':
                        console.log('❌ Pickup failed - notifying admin');
                        workflowMessage = 'Pickup failed - requires manual intervention';
                        // TODO: Send notification to admin
                        break;
                }
            }
        }

        // Send response - Always return 200 as per Shiprocket requirement
        return NextResponse.json({
            success: true,
            message: workflowMessage,
            returnNumber: returnRequest.returnNumber,
            currentStatus: returnRequest.status,
            automation: triggeredAutomation
        }, {
            status: 200,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('❌ Return webhook processing error:', error);
        // Return 200 even on error as per Shiprocket requirement
        return NextResponse.json(
            { success: false, message: 'Webhook processing failed', error: error.message },
            { status: 200, headers: corsHeaders }
        );
    }
}

/**
 * GET endpoint for webhook health check and verification
 */
export async function GET() {
    return NextResponse.json({
        status: 'active',
        webhook: 'automated-return-workflow',
        description: 'Handles automated return processing and tracking',
        timestamp: new Date().toISOString(),
        endpoint: '/api/webhooks/reverse-pickup',
        methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
        requirements: {
            contentType: 'application/json',
            securityHeader: 'anx-api-key',
            responseCode: 'Always returns 200',
            restrictedKeywords: ['shiprocket', 'kartrocket', 'sr', 'kr', 'return', 'tracking']
        }
    }, {
        status: 200,
        headers: corsHeaders
    });
}

/**
 * HEAD endpoint for webhook verification
 */
export async function HEAD() {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders
    });
}
