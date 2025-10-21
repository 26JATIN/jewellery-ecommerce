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
    'Access-Control-Allow-Headers': 'Content-Type, x-shiprocket-signature, Authorization',
    'Content-Type': 'application/json',
};

/**
 * AUTOMATED RETURN WORKFLOW WEBHOOK
 * 
 * ⚠️ IMPORTANT: Shiprocket URL Naming Requirement
 * This endpoint is named "reverse-pickup" because Shiprocket does NOT allow certain 
 * keywords in webhook URLs including: "shiprocket", "kartrocket", "sr", "kr", "return", "tracking"
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

        // Verify webhook authenticity
        const signature = req.headers.get('x-shiprocket-signature');
        const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;
        
        if (!verifyWebhookSignature(webhookData, signature, webhookSecret)) {
            console.error('❌ Invalid webhook signature for return');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401, headers: corsHeaders }
            );
        }
        
        console.log('✅ Return webhook signature verified');
        
        // Extract webhook data
        const {
            awb,
            current_status,
            current_status_code,
            shipment_id,
            order_id,
            courier_name,
            pickup_scheduled_date,
            delivered_date,
            current_timestamp,
            location,
            tracking_data,
            shipment_type
        } = webhookData;

        if (!awb && !shipment_id) {
            return NextResponse.json(
                { error: 'AWB or Shipment ID required' },
                { status: 400, headers: corsHeaders }
            );
        }

        await connectDB();

        // Find return by AWB code or shipment ID
        let returnRequest;
        if (awb) {
            returnRequest = await Return.findOne({ 'pickup.awbCode': awb })
                .populate('order')
                .populate('user');
        } else if (shipment_id) {
            returnRequest = await Return.findOne({ 'pickup.shipmentId': shipment_id })
                .populate('order')
                .populate('user');
        }

        if (!returnRequest) {
            console.log(`Return not found for AWB: ${awb}, Shipment ID: ${shipment_id}`);
            return NextResponse.json(
                { message: 'Return not found' },
                { status: 404, headers: corsHeaders }
            );
        }

        console.log(`📋 Processing return ${returnRequest.returnNumber} (${returnRequest._id})`);

        /**
         * AUTOMATED STATUS MAPPING FOR RETURN WORKFLOW
         * 
         * Shiprocket Status Code → Automated Return Status
         */
        const returnStatusMapping = {
            // Pickup phase
            2: {  // Pickup Scheduled
                returnStatus: 'pickup_scheduled',
                pickupStatus: 'scheduled',
                action: 'update',
                automate: true
            },
            13: { // Pickup Rescheduled
                returnStatus: 'pickup_scheduled',
                pickupStatus: 'scheduled',
                action: 'update',
                automate: true
            },
            
            // Transit phase
            3: {  // Picked Up
                returnStatus: 'picked_up',
                pickupStatus: 'completed',
                action: 'update',
                automate: true
            },
            4: {  // In Transit
                returnStatus: 'in_transit',
                pickupStatus: 'completed',
                action: 'update',
                automate: true
            },
            25: { // Reached Origin Hub
                returnStatus: 'in_transit',
                pickupStatus: 'completed',
                action: 'update',
                automate: true
            },
            38: { // Reached Destination Hub
                returnStatus: 'in_transit',
                pickupStatus: 'completed',
                action: 'update',
                automate: true
            },
            
            // Delivery to warehouse
            6: {  // Delivered (to warehouse)
                returnStatus: 'received',
                pickupStatus: 'completed',
                action: 'trigger_inspection',
                automate: true
            },
            
            // Failed scenarios
            7: {  // RTO Initiated (Return failed)
                returnStatus: 'pickup_failed',
                pickupStatus: 'failed',
                action: 'notify_admin',
                automate: false
            },
            9: {  // Lost
                returnStatus: 'pickup_failed',
                pickupStatus: 'failed',
                action: 'notify_admin',
                automate: false
            },
            10: { // Damaged in Transit
                returnStatus: 'pickup_failed',
                pickupStatus: 'failed',
                action: 'notify_admin',
                automate: false
            }
        };

        const statusAction = returnStatusMapping[current_status_code];

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
        let workflowMessage = `Tracking updated: ${current_status}`;
        let triggeredAutomation = null;

        if (statusAction?.automate && statusAction.returnStatus) {
            // Check if status change is needed
            if (returnRequest.status !== statusAction.returnStatus) {
                console.log(`🤖 Automating status change: ${returnRequest.status} → ${statusAction.returnStatus}`);
                
                // Update status via the model method to trigger any hooks
                await returnRequest.updateStatus(
                    statusAction.returnStatus,
                    'system_automation',
                    `Automated update from Shiprocket: ${current_status}`
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

        // Send response
        return NextResponse.json({
            success: true,
            message: workflowMessage,
            returnNumber: returnRequest.returnNumber,
            currentStatus: returnRequest.status,
            automation: triggeredAutomation,
            shiprocketStatus: current_status
        }, {
            headers: corsHeaders
        });

    } catch (error) {
        console.error('❌ Return webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed', details: error.message },
            { status: 500, headers: corsHeaders }
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
        note: 'URL avoids restricted keywords: shiprocket, kartrocket, sr, kr, return, tracking'
    }, {
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
