import { shippingService } from './shippingService.js';
import connectDB from './mongodb.js';
import Order from '../models/Order.js';

class OrderAutomationService {
    constructor() {
        this.autoShipEnabled = process.env.AUTO_SHIP_ENABLED === 'true';
        this.autoShipDelay = parseInt(process.env.AUTO_SHIP_DELAY_MINUTES) || 30; // minutes
    }

    // Automatically process order after payment confirmation
    async processNewOrder(orderId) {
        try {
            console.log(`Processing new order: ${orderId}`);
            
            await connectDB();
            const order = await Order.findById(orderId);
            
            if (!order) {
                throw new Error('Order not found');
            }

            // Only process paid orders
            if (order.payment.status !== 'completed') {
                console.log(`Order ${orderId} payment not completed, skipping auto-ship`);
                return;
            }

            // Check if shipping already initiated
            if (order.shipping.shipmentId) {
                console.log(`Order ${orderId} already has shipment, skipping`);
                return;
            }

            if (this.autoShipEnabled) {
                // Add delay before creating shipment (to allow for order verification)
                setTimeout(async () => {
                    try {
                        await this.createAutomaticShipment(orderId);
                    } catch (error) {
                        console.error(`Auto-ship failed for order ${orderId}:`, error);
                        // You could implement notification to admin here
                    }
                }, this.autoShipDelay * 60 * 1000);
            }

        } catch (error) {
            console.error(`Error processing new order ${orderId}:`, error);
            throw error;
        }
    }

    // Create shipment automatically
    async createAutomaticShipment(orderId) {
        try {
            console.log(`Creating automatic shipment for order: ${orderId}`);
            
            // Use the shipping service to automate the entire process
            const result = await shippingService.automateShipping(orderId);
            
            console.log(`Automatic shipment created successfully:`, result);
            
            // Update order status
            await Order.findByIdAndUpdate(orderId, {
                'shipping.automatedAt': new Date()
            });

            // Send notification to customer about shipment creation
            await this.notifyCustomer(orderId, result);
            
            return result;
        } catch (error) {
            console.error(`Automatic shipment creation failed for order ${orderId}:`, error);
            
            // Update order with error information
            await Order.findByIdAndUpdate(orderId, {
                'shipping.automationError': error.message,
                'shipping.automationFailedAt': new Date()
            });
            
            throw error;
        }
    }

    // Retry failed shipments
    async retryFailedShipments() {
        try {
            await connectDB();
            
            // Find orders with automation failures from last 24 hours
            const failedOrders = await Order.find({
                'payment.status': 'completed',
                'shipping.automationError': { $exists: true },
                'shipping.shipmentId': { $exists: false },
                'shipping.automationFailedAt': {
                    $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            });

            console.log(`Found ${failedOrders.length} failed shipments to retry`);

            const retryPromises = failedOrders.map(async (order) => {
                try {
                    await this.createAutomaticShipment(order._id);
                    return { orderId: order._id, success: true };
                } catch (error) {
                    console.error(`Retry failed for order ${order._id}:`, error);
                    return { orderId: order._id, success: false, error: error.message };
                }
            });

            const results = await Promise.allSettled(retryPromises);
            const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
            
            console.log(`Retry completed: ${successful}/${failedOrders.length} successful`);
            return { total: failedOrders.length, successful, failed: failedOrders.length - successful };
            
        } catch (error) {
            console.error('Error retrying failed shipments:', error);
            throw error;
        }
    }

    // Send notification to customer
    async notifyCustomer(orderId, shipmentData) {
        try {
            // Implement customer notification logic here
            // This could be email, SMS, push notification, etc.
            console.log(`Sending shipment notification for order ${orderId}:`, {
                awbCode: shipmentData.awbCode,
                courier: shipmentData.courier,
                trackingUrl: shipmentData.trackingUrl
            });

            // Example: Send email notification
            // await emailService.sendShipmentNotification(order.user.email, shipmentData);
            
        } catch (error) {
            console.error(`Failed to notify customer for order ${orderId}:`, error);
            // Don't throw error as notification failure shouldn't stop the shipment process
        }
    }

    // Automatic tracking updates (run periodically via cron job)
    async runPeriodicTrackingUpdate() {
        try {
            console.log('Running periodic tracking update...');
            
            const result = await shippingService.bulkUpdateTracking();
            
            console.log('Periodic tracking update completed:', result);
            return result;
            
        } catch (error) {
            console.error('Periodic tracking update failed:', error);
            throw error;
        }
    }

    // Check for delivered orders and update status
    async checkDeliveredOrders() {
        try {
            await connectDB();
            
            // Find orders that might be delivered but status not updated
            const shippedOrders = await Order.find({
                'shipping.status': 'shipped',
                'shipping.awbCode': { $exists: true, $ne: null },
                'shipping.lastUpdateAt': {
                    $lte: new Date(Date.now() - 6 * 60 * 60 * 1000) // Not updated in last 6 hours
                }
            });

            console.log(`Checking delivery status for ${shippedOrders.length} orders`);

            for (const order of shippedOrders) {
                try {
                    await shippingService.updateTrackingInfo(order._id);
                } catch (error) {
                    console.error(`Failed to update tracking for order ${order._id}:`, error);
                }
            }

            return { checked: shippedOrders.length };
            
        } catch (error) {
            console.error('Error checking delivered orders:', error);
            throw error;
        }
    }

    // Manual trigger for automation
    async manualProcessOrder(orderId) {
        try {
            return await this.createAutomaticShipment(orderId);
        } catch (error) {
            console.error(`Manual process failed for order ${orderId}:`, error);
            throw error;
        }
    }
}

const orderAutomationService = new OrderAutomationService();
export { orderAutomationService };