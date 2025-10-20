import { shiprocket } from './shiprocket.js';
import connectDB from './mongodb.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

class ShippingService {
    constructor() {
        this.defaultPickupPostcode = process.env.SHIPROCKET_PICKUP_POSTCODE || '110001';
        this.defaultWeight = 0.5; // kg
        this.defaultDimensions = {
            length: 15,
            breadth: 10,
            height: 5
        };
    }

    // Format phone number to 10 digits (removed duplicate)
    formatPhoneNumber(phone) {
        if (!phone) return null;
        
        // Remove all non-digits
        let digits = phone.replace(/\D/g, '');
        
        // Remove country code if present
        if (digits.startsWith('91') && digits.length === 12) {
            digits = digits.substring(2);
        }
        
        // Return last 10 digits if longer
        if (digits.length > 10) {
            digits = digits.slice(-10);
        }
        
        // Return 10-digit number or null if invalid
        return digits.length === 10 ? digits : null;
    }

    // Format order data for Shiprocket
    formatOrderForShiprocket(order, user) {
        // Split full name into first and last name
        const nameParts = order.shippingAddress.fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        return {
            orderId: order._id.toString(),
            orderDate: order.createdAt.toISOString().split('T')[0],
            customer: {
                name: firstName,
                lastName: lastName,
                address: order.shippingAddress.addressLine1,
                address2: order.shippingAddress.addressLine2 || '',
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                pincode: order.shippingAddress.postalCode,
                country: order.shippingAddress.country === 'IN' ? 'India' : (order.shippingAddress.country || 'India'),
                email: user?.email || 'customer@example.com',
                phone: this.formatPhoneNumber(order.shippingAddress.phone)
            },
            items: order.items.map(item => ({
                name: item.name,
                sku: item.product?.toString() || item.name.replace(/\s+/g, '-').toLowerCase(),
                quantity: item.quantity,
                price: item.price
            })),
            paymentMethod: order.paymentMethod,
            subtotal: order.totalAmount,
            shippingCharges: 0,
            discount: 0,
            weight: this.calculateWeight(order.items),
            dimensions: this.defaultDimensions
        };
    }

    // Calculate package weight based on items
    calculateWeight(items) {
        // Default weight calculation - can be enhanced with product-specific weights
        const baseWeight = 0.1; // kg per item
        return Math.max(items.reduce((total, item) => total + (item.quantity * baseWeight), 0), 0.5);
    }

    // Validate order data before shipping
    validateOrderForShipping(order, user) {
        const errors = [];

        console.log('Validating order for shipping:', {
            orderId: order._id,
            hasShippingAddress: !!order.shippingAddress,
            hasUser: !!user,
            userEmail: user?.email,
            shippingAddress: order.shippingAddress
        });

        if (!order.shippingAddress) {
            errors.push('Shipping address is required');
        } else {
            const addr = order.shippingAddress;
            if (!addr.fullName) errors.push('Full name is required');
            if (!addr.addressLine1) errors.push('Address line 1 is required');
            if (!addr.city) errors.push('City is required');
            if (!addr.state) errors.push('State is required');
            if (!addr.postalCode) errors.push('Postal code is required');
            if (!addr.phone) errors.push('Phone number is required');
            
            // Validate postal code is numeric and 6 digits for India
            if (addr.postalCode && !/^\d{6}$/.test(addr.postalCode)) {
                errors.push('Postal code must be 6 digits');
            }

            // Validate phone number format
            const formattedPhone = this.formatPhoneNumber(addr.phone);
            if (!formattedPhone || formattedPhone.length !== 10) {
                errors.push('Phone number must be 10 digits');
            }
        }

        if (!order.items || order.items.length === 0) {
            errors.push('Order items are required');
        }

        if (!order.totalAmount || order.totalAmount <= 0) {
            errors.push('Valid total amount is required');
        }

        if (!user || !user.email) {
            errors.push('User email is required for shipping');
        }

        if (errors.length > 0) {
            console.error('Order validation errors:', errors);
            throw new Error(`Order validation failed: ${errors.join(', ')}`);
        }

        console.log('Order validation passed');
    }

    // Create shipment automatically
    async createShipment(orderId) {
        try {
            await connectDB();
            
            const order = await Order.findById(orderId).populate('user');
            if (!order) {
                throw new Error('Order not found');
            }

            if (order.shipping?.shipmentId) {
                throw new Error('Shipment already created for this order');
            }

            // Validate order data
            this.validateOrderForShipping(order, order.user);

            // Format order data
            const orderData = this.formatOrderForShiprocket(order, order.user);
            
            console.log('Formatted order data for Shiprocket:', JSON.stringify(orderData, null, 2));

            // Create order in Shiprocket
            const response = await shiprocket.createOrder(orderData);
            
            console.log('Shiprocket response:', JSON.stringify(response, null, 2));

            if (response.status_code === 1) {
                // Update order with shipment details
                await Order.findByIdAndUpdate(orderId, {
                    'shipping.shipmentId': response.shipment_id,
                    'shipping.status': 'processing',
                    'status': 'processing'
                });

                console.log(`Shipment created successfully: ${response.shipment_id}`);
                return response;
            } else {
                throw new Error(response.message || 'Failed to create shipment');
            }
        } catch (error) {
            console.error('Error creating shipment:', error);
            throw error;
        }
    }

    // Get best courier for shipment
    async getBestCourier(pickupPostcode, deliveryPostcode, weight, codAmount = 0) {
        try {
            const response = await shiprocket.getAvailableCouriers(
                pickupPostcode, 
                deliveryPostcode, 
                weight, 
                codAmount
            );

            if (response.status === 200 && response.data?.available_courier_companies?.length > 0) {
                // Sort by rate and select the cheapest available courier
                const couriers = response.data.available_courier_companies
                    .filter(courier => courier.is_surface && courier.freight_charge > 0)
                    .sort((a, b) => a.rate - b.rate);

                return couriers[0] || response.data.available_courier_companies[0];
            }

            throw new Error('No available couriers found');
        } catch (error) {
            console.error('Error getting couriers:', error);
            throw error;
        }
    }

    // Assign AWB and generate pickup with automatic courier selection and retry
    async processShipment(orderId) {
        try {
            await connectDB();
            
            const order = await Order.findById(orderId);
            if (!order || !order.shipping.shipmentId) {
                throw new Error('Order or shipment not found');
            }

            // Get all available couriers sorted by price
            const response = await shiprocket.getAvailableCouriers(
                this.defaultPickupPostcode,
                order.shippingAddress.postalCode,
                this.calculateWeight(order.items),
                order.paymentMethod === 'COD' ? order.totalAmount : 0
            );

            if (response.status !== 200 || !response.data?.available_courier_companies?.length) {
                throw new Error('No available couriers found for this route');
            }

            // Sort couriers by price (cheapest first)
            const couriers = response.data.available_courier_companies
                .filter(courier => courier.is_surface && courier.freight_charge > 0)
                .sort((a, b) => a.rate - b.rate);

            if (couriers.length === 0) {
                throw new Error('No suitable couriers available for this shipment');
            }

            console.log(`Found ${couriers.length} available couriers, attempting automatic assignment...`);
            
            // Try each courier in order (cheapest first) until one succeeds
            let lastError = null;
            for (let i = 0; i < Math.min(couriers.length, 3); i++) { // Try up to 3 couriers
                const courier = couriers[i];
                console.log(`Attempting courier ${i + 1}/${Math.min(couriers.length, 3)}: ${courier.courier_name} (₹${courier.rate})`);
                
                try {
                    // Assign AWB
                    const awbResponse = await shiprocket.assignAWB(
                        order.shipping.shipmentId,
                        courier.courier_company_id
                    );

                    if (awbResponse.status_code === 1 || awbResponse.awb_assign_status === 1) {
                        // Generate pickup
                        const pickupResponse = await shiprocket.generatePickup(order.shipping.shipmentId);

                        // Update order with AWB and courier details
                        await Order.findByIdAndUpdate(orderId, {
                            'shipping.awbCode': awbResponse.awb_code,
                            'shipping.courier': courier.courier_name,
                            'shipping.trackingUrl': `https://shiprocket.in/tracking/${awbResponse.awb_code}`,
                            'shipping.status': 'shipped',
                            'status': 'shipped'
                        });

                        console.log(`✅ Successfully assigned AWB: ${awbResponse.awb_code} with ${courier.courier_name}`);
                        return {
                            awbCode: awbResponse.awb_code,
                            courier: courier.courier_name,
                            pickupScheduled: pickupResponse.status_code === 1
                        };
                    } else {
                        // Check for specific rejection reasons
                        const errorMsg = awbResponse.message || awbResponse.error || 'AWB assignment failed';
                        
                        // If it's a balance error, don't try other couriers
                        if (errorMsg.toLowerCase().includes('balance') || errorMsg.toLowerCase().includes('insufficient')) {
                            throw new Error(`BALANCE_ERROR: ${errorMsg}`);
                        }
                        
                        lastError = errorMsg;
                        console.warn(`⚠️  Courier ${courier.courier_name} rejected: ${lastError}`);
                    }
                } catch (courierError) {
                    lastError = courierError.message;
                    console.warn(`⚠️  Failed to assign ${courier.courier_name}: ${courierError.message}`);
                    continue; // Try next courier
                }
            }

            // If we got here, all couriers failed
            throw new Error(lastError || 'All courier assignment attempts failed');
            
        } catch (error) {
            console.error('Error processing shipment:', error);
            throw error;
        }
    }

    // Complete automation: Create + Process shipment
    async automateShipping(orderId) {
        try {
            console.log(`Starting automated shipping for order: ${orderId}`);
            
            // Step 1: Create shipment
            const shipmentResponse = await this.createShipment(orderId);
            console.log(`✅ Step 1 complete: Shipment created - ID: ${shipmentResponse.shipment_id}`);
            
            // Step 2: Process shipment (assign AWB + generate pickup)
            // This step might fail due to insufficient balance or other Shiprocket issues
            let processResponse;
            try {
                processResponse = await this.processShipment(orderId);
                console.log(`✅ Step 2 complete: Courier assigned and pickup scheduled - AWB: ${processResponse.awbCode}`);
                
                return {
                    success: true,
                    shipmentId: shipmentResponse.shipment_id,
                    awbCode: processResponse.awbCode,
                    courier: processResponse.courier,
                    trackingUrl: `https://shiprocket.in/tracking/${processResponse.awbCode}`,
                    fullyAutomated: true
                };
            } catch (processingError) {
                console.warn(`⚠️  Step 2 failed (courier assignment): ${processingError.message}`);
                
                // Check if it's an insufficient balance error
                const isBalanceError = processingError.message?.toLowerCase().includes('balance') || 
                                      processingError.message?.toLowerCase().includes('insufficient') ||
                                      processingError.message?.startsWith('BALANCE_ERROR:');
                
                if (isBalanceError) {
                    console.error(`❌ Insufficient Shiprocket balance! Please recharge your account.`);
                    
                    // Update order with balance error note
                    await Order.findByIdAndUpdate(orderId, {
                        'shipping.status': 'pending_balance',
                        'shipping.errorMessage': 'Insufficient Shiprocket balance. Shipment created but awaiting courier assignment.'
                    });
                    
                    return {
                        success: false,
                        error: 'INSUFFICIENT_BALANCE',
                        message: 'Insufficient Shiprocket balance. Please recharge your account and assign courier manually.',
                        shipmentId: shipmentResponse.shipment_id,
                        requiresManualIntervention: true
                    };
                }
                
                // If all automatic courier attempts failed, require manual selection
                console.log(`❌ All automatic courier assignment attempts failed: ${processingError.message}`);
                console.log(`📝 Admin will need to manually assign a courier on Shiprocket dashboard`);
                
                // Update order with partial success
                await Order.findByIdAndUpdate(orderId, {
                    'shipping.status': 'pending_courier',
                    'shipping.errorMessage': `Automatic courier assignment failed: ${processingError.message}. Please assign courier manually on Shiprocket.`
                });
                
                // Return partial success
                return {
                    success: true,
                    shipmentId: shipmentResponse.shipment_id,
                    awbCode: null,
                    courier: 'Pending manual selection',
                    trackingUrl: null,
                    fullyAutomated: false,
                    requiresManualCourier: true,
                    message: `Shipment created successfully. Automatic courier assignment failed (${processingError.message}). Please assign courier manually on Shiprocket.`
                };
            }
        } catch (error) {
            console.error(`❌ Automated shipping failed for order ${orderId}:`, error);
            
            // Check if it's a balance error at the shipment creation level
            const isBalanceError = error.message?.toLowerCase().includes('balance') || 
                                  error.message?.toLowerCase().includes('insufficient');
            
            if (isBalanceError) {
                return {
                    success: false,
                    error: 'INSUFFICIENT_BALANCE',
                    message: 'Insufficient Shiprocket balance. Please recharge your account.',
                    requiresManualIntervention: true
                };
            }
            
            // Return failure for other errors
            return {
                success: false,
                error: error.message,
                requiresManualIntervention: true
            };
        }
    }

    // Update tracking information
    async updateTrackingInfo(orderId) {
        try {
            await connectDB();
            
            const order = await Order.findById(orderId);
            if (!order || !order.shipping.awbCode) {
                throw new Error('Order or AWB code not found');
            }

            const trackingData = await shiprocket.trackByAWB(order.shipping.awbCode);

            if (trackingData.status === 200 && trackingData.data?.length > 0) {
                const tracking = trackingData.data[0];
                
                const updateData = {
                    'shipping.currentLocation': tracking.current_status,
                    'shipping.lastUpdateAt': new Date(),
                    'shipping.trackingHistory': tracking.scans?.map(scan => ({
                        activity: scan.activity,
                        location: scan.location,
                        timestamp: new Date(scan.date),
                        statusCode: scan.status_code
                    })) || []
                };

                // Update order status based on tracking
                const statusMapping = {
                    'Delivered': { shipping: 'delivered', order: 'delivered' },
                    'Out for Delivery': { shipping: 'shipped', order: 'shipped' },
                    'In Transit': { shipping: 'shipped', order: 'shipped' },
                    'Picked Up': { shipping: 'shipped', order: 'shipped' },
                    'Cancelled': { shipping: 'cancelled', order: 'cancelled' },
                    'RTO': { shipping: 'cancelled', order: 'cancelled' }
                };

                const currentStatus = tracking.current_status;
                if (statusMapping[currentStatus]) {
                    updateData['shipping.status'] = statusMapping[currentStatus].shipping;
                    updateData['status'] = statusMapping[currentStatus].order;
                }

                if (tracking.edd) {
                    updateData['shipping.eta'] = new Date(tracking.edd);
                }

                await Order.findByIdAndUpdate(orderId, updateData);
                
                return {
                    status: currentStatus,
                    location: tracking.current_status,
                    eta: tracking.edd,
                    trackingHistory: updateData['shipping.trackingHistory']
                };
            }

            throw new Error('No tracking data available');
        } catch (error) {
            console.error('Error updating tracking info:', error);
            throw error;
        }
    }

    // Bulk update tracking for all active shipments
    async bulkUpdateTracking() {
        try {
            await connectDB();
            
            const activeOrders = await Order.find({
                'shipping.awbCode': { $exists: true, $ne: null },
                'shipping.status': { $in: ['processing', 'shipped'] }
            });

            console.log(`Updating tracking for ${activeOrders.length} active shipments`);

            const updatePromises = activeOrders.map(async (order) => {
                try {
                    await this.updateTrackingInfo(order._id);
                    return { orderId: order._id, success: true };
                } catch (error) {
                    console.error(`Failed to update tracking for order ${order._id}:`, error);
                    return { orderId: order._id, success: false, error: error.message };
                }
            });

            const results = await Promise.allSettled(updatePromises);
            const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
            
            console.log(`Bulk tracking update completed: ${successful}/${activeOrders.length} successful`);
            return { total: activeOrders.length, successful, failed: activeOrders.length - successful };
        } catch (error) {
            console.error('Error in bulk tracking update:', error);
            throw error;
        }
    }

    // Cancel shipment
    async cancelShipment(orderId) {
        try {
            await connectDB();
            
            const order = await Order.findById(orderId);
            if (!order || !order.shipping.awbCode) {
                throw new Error('Order or AWB code not found');
            }

            const response = await shiprocket.cancelShipment(order.shipping.awbCode);

            if (response.status_code === 1) {
                await Order.findByIdAndUpdate(orderId, {
                    'shipping.status': 'cancelled',
                    'status': 'cancelled'
                });

                return { success: true, message: 'Shipment cancelled successfully' };
            } else {
                throw new Error(response.message || 'Failed to cancel shipment');
            }
        } catch (error) {
            console.error('Error cancelling shipment:', error);
            throw error;
        }
    }

    // Generate shipping label
    async generateLabel(orderId) {
        try {
            await connectDB();
            
            const order = await Order.findById(orderId);
            if (!order || !order.shipping.shipmentId) {
                throw new Error('Order or shipment not found');
            }

            const response = await shiprocket.generateLabel(order.shipping.shipmentId);
            
            if (response.status === 200) {
                return {
                    labelUrl: response.label_url,
                    manifestUrl: response.manifest_url
                };
            } else {
                throw new Error('Failed to generate label');
            }
        } catch (error) {
            console.error('Error generating label:', error);
            throw error;
        }
    }
}

const shippingService = new ShippingService();
export { shippingService };