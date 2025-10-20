import { shiprocket } from '@/lib/shiprocket';
import connectDB from './mongodb.js';
import Return from '../models/Return.js';
import Order from '../models/Order.js';

class ReversePickupService {
    constructor() {
        this.defaultWarehouseLocation = {
            address: process.env.WAREHOUSE_ADDRESS || "Rajpura, Punjab",
            city: process.env.WAREHOUSE_CITY || "Rajpura",
            state: process.env.WAREHOUSE_STATE || "Punjab", 
            pincode: process.env.WAREHOUSE_PINCODE || "140401",
            phone: process.env.WAREHOUSE_PHONE || "6230378893",
            email: process.env.WAREHOUSE_EMAIL || "returns@jewelrystore.com"
        };
    }

    // Format phone number for Shiprocket (10 digits, no country code)
    formatPhoneNumber(phone) {
        if (!phone) return null;
        
        // Remove all non-digits
        let digits = phone.replace(/\D/g, '');
        
        // Remove country code if present
        if (digits.startsWith('91') && digits.length === 12) {
            digits = digits.substring(2);
        }
        
        // Return 10-digit number or null if invalid
        return digits.length === 10 ? digits : null;
    }

    // Format return data for Shiprocket reverse pickup
    formatReturnForShiprocket(returnRequest, order, user) {
        // Customer address (where to pick up from)
        const pickupAddress = returnRequest.pickup.address;
        
        // Split customer name
        const nameParts = pickupAddress.fullName?.trim().split(' ') || ['Customer'];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        return {
            returnNumber: returnRequest.returnNumber,
            returnDate: returnRequest.createdAt.toISOString().split('T')[0],
            customer: {
                // Customer details (pickup location)
                name: firstName,
                lastName: lastName,
                address: pickupAddress.addressLine1,
                address2: pickupAddress.addressLine2 || '',
                city: pickupAddress.city,
                state: pickupAddress.state,
                pincode: pickupAddress.postalCode,
                country: pickupAddress.country === 'IN' ? 'India' : (pickupAddress.country || 'India'),
                email: user?.email || 'customer@example.com',
                phone: this.formatPhoneNumber(pickupAddress.phone)
            },
            warehouse: {
                // Warehouse details (delivery location)
                name: "Returns",
                lastName: "Team",
                address: this.defaultWarehouseLocation.address,
                address2: "",
                city: this.defaultWarehouseLocation.city,
                state: this.defaultWarehouseLocation.state,
                pincode: this.defaultWarehouseLocation.pincode,
                country: "India",
                email: this.defaultWarehouseLocation.email,
                phone: this.defaultWarehouseLocation.phone
            },
            items: returnRequest.items.map(item => ({
                name: item.name,
                sku: `RET-${item.product?.toString() || 'ITEM'}`,
                quantity: item.quantity,
                price: item.price
            })),
            totalValue: returnRequest.refundDetails.originalAmount,
            weight: this.calculateReturnWeight(returnRequest.items),
            dimensions: {
                length: 15,
                breadth: 10,
                height: 5
            }
        };
    }

    // Calculate package weight for return items
    calculateReturnWeight(items) {
        // Base weight for jewelry items
        const baseWeight = 0.1; // kg per item
        return Math.max(items.reduce((total, item) => total + (item.quantity * baseWeight), 0), 0.3);
    }

    // Validate return for reverse pickup
    validateReturnForPickup(returnRequest, order, user) {
        const errors = [];

        console.log('Validating return for pickup:', {
            returnId: returnRequest._id,
            returnNumber: returnRequest.returnNumber,
            hasPickupAddress: !!returnRequest.pickup.address,
            hasUser: !!user,
            userEmail: user?.email
        });

        if (!returnRequest.pickup.address) {
            errors.push('Pickup address is required');
        } else {
            const addr = returnRequest.pickup.address;
            if (!addr.fullName) errors.push('Full name is required for pickup');
            if (!addr.addressLine1) errors.push('Pickup address is required');
            if (!addr.city) errors.push('Pickup city is required');
            if (!addr.state) errors.push('Pickup state is required');
            if (!addr.postalCode) errors.push('Pickup postal code is required');
            if (!addr.phone) errors.push('Pickup phone number is required');
            
            // Validate postal code format
            if (addr.postalCode && !/^\d{6}$/.test(addr.postalCode)) {
                errors.push('Pickup postal code must be 6 digits');
            }

            // Validate phone number format
            const formattedPhone = this.formatPhoneNumber(addr.phone);
            if (!formattedPhone || formattedPhone.length !== 10) {
                errors.push('Pickup phone number must be 10 digits');
            }
        }

        if (!returnRequest.items || returnRequest.items.length === 0) {
            errors.push('Return items are required');
        }

        if (!returnRequest.refundDetails.originalAmount || returnRequest.refundDetails.originalAmount <= 0) {
            errors.push('Valid return amount is required');
        }

        if (!user || !user.email) {
            errors.push('User email is required for return pickup');
        }

        // Check return status
        if (!['approved', 'pickup_scheduled'].includes(returnRequest.status)) {
            errors.push('Return must be approved before scheduling pickup');
        }

        if (errors.length > 0) {
            console.error('Return pickup validation errors:', errors);
            throw new Error(`Return pickup validation failed: ${errors.join(', ')}`);
        }

        console.log('Return pickup validation passed');
    }

    // Create reverse pickup shipment
    async createReversePickup(returnId) {
        try {
            await connectDB();
            
            const returnRequest = await Return.findById(returnId).populate('user order');
            if (!returnRequest) {
                throw new Error('Return request not found');
            }

            if (returnRequest.pickup?.shipmentId) {
                throw new Error('Reverse pickup already created for this return');
            }

            const order = returnRequest.order;
            const user = returnRequest.user;

            // Validate return data
            this.validateReturnForPickup(returnRequest, order, user);

            // Format return data for Shiprocket
            const returnData = this.formatReturnForShiprocket(returnRequest, order, user);
            
            console.log('Formatted return data for Shiprocket reverse pickup:', JSON.stringify(returnData, null, 2));

            // Create reverse pickup order in Shiprocket with retry mechanism
            let response;
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
                try {
                    response = await shiprocket.createReversePickup(returnData);
                    
                    if (response.status_code === 1) {
                        break; // Success
                    } else if (retryCount < maxRetries - 1) {
                        console.warn(`Shiprocket attempt ${retryCount + 1} failed: ${response.message}. Retrying...`);
                        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
                        retryCount++;
                    } else {
                        throw new Error(response.message || 'Failed to create reverse pickup');
                    }
                } catch (apiError) {
                    if (retryCount < maxRetries - 1) {
                        console.warn(`Shiprocket API error on attempt ${retryCount + 1}: ${apiError.message}. Retrying...`);
                        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
                        retryCount++;
                    } else {
                        throw apiError;
                    }
                }
            }
            
            console.log('Shiprocket reverse pickup response:', JSON.stringify(response, null, 2));

            if (response.status_code === 1) {
                // Update return with pickup details
                await Return.findByIdAndUpdate(returnId, {
                    'pickup.shipmentId': response.shipment_id,
                    'pickup.pickupStatus': 'scheduled',
                    'status': 'pickup_scheduled'
                });

                console.log(`Reverse pickup created successfully: ${response.shipment_id}`);
                return response;
            } else {
                throw new Error(response.message || 'Failed to create reverse pickup');
            }
        } catch (error) {
            console.error('Error creating reverse pickup:', error);
            
            // Rollback: Mark return as approved but with pickup failure note
            try {
                await Return.findByIdAndUpdate(returnId, {
                    'pickup.pickupStatus': 'failed',
                    'status': 'approved', // Rollback to approved for manual intervention
                    '$push': {
                        'adminNotes': {
                            note: `Automatic pickup scheduling failed: ${error.message}. Requires manual scheduling.`,
                            addedAt: new Date()
                        }
                    }
                });
                console.log('Rolled back return status due to Shiprocket failure');
            } catch (rollbackError) {
                console.error('Failed to rollback return status:', rollbackError);
            }
            
            throw error;
        }
    }

    // Get best courier for reverse pickup
    async getBestReturnCourier(fromPincode, toPincode, weight) {
        try {
            const response = await shiprocket.getReturnCouriers(fromPincode, toPincode, weight);

            if (response.status === 200 && response.data?.available_courier_companies?.length > 0) {
                // Sort by rate and select the cheapest available courier
                const couriers = response.data.available_courier_companies
                    .filter(courier => courier.is_surface && courier.freight_charge > 0)
                    .sort((a, b) => a.rate - b.rate);

                return couriers[0] || response.data.available_courier_companies[0];
            }

            throw new Error('No available couriers found for return pickup');
        } catch (error) {
            console.error('Error getting return couriers:', error);
            throw error;
        }
    }

    // Process reverse pickup (assign AWB and schedule pickup)
    async processReversePickup(returnId) {
        try {
            await connectDB();
            
            const returnRequest = await Return.findById(returnId);
            if (!returnRequest || !returnRequest.pickup.shipmentId) {
                throw new Error('Return or shipment not found');
            }

            // Get best courier
            const courier = await this.getBestReturnCourier(
                returnRequest.pickup.address.postalCode,
                this.defaultWarehouseLocation.pincode,
                this.calculateReturnWeight(returnRequest.items)
            );

            // Assign AWB for reverse pickup
            const awbResponse = await shiprocket.assignReturnCourier(
                returnRequest.pickup.shipmentId,
                courier.courier_company_id
            );

            if (awbResponse.status_code === 1) {
                // Schedule pickup
                const pickupResponse = await shiprocket.scheduleReturnPickup(
                    returnRequest.pickup.shipmentId
                );

                // Update return with AWB and courier details
                await Return.findByIdAndUpdate(returnId, {
                    'pickup.awbCode': awbResponse.awb_code,
                    'pickup.courier': courier.courier_name,
                    'pickup.trackingUrl': `https://shiprocket.in/tracking/${awbResponse.awb_code}`,
                    'pickup.pickupStatus': 'scheduled',
                    'status': 'pickup_scheduled'
                });

                console.log(`Reverse pickup processed: AWB ${awbResponse.awb_code}`);
                return {
                    awbCode: awbResponse.awb_code,
                    courier: courier.courier_name,
                    pickupScheduled: pickupResponse.status_code === 1,
                    trackingUrl: `https://shiprocket.in/tracking/${awbResponse.awb_code}`
                };
            } else {
                throw new Error(awbResponse.message || 'Failed to assign AWB for return');
            }
        } catch (error) {
            console.error('Error processing reverse pickup:', error);
            throw error;
        }
    }

    // Complete automation: Create + Process reverse pickup
    async automateReversePickup(returnId) {
        try {
            console.log(`Starting automated reverse pickup for return: ${returnId}`);
            
            // Step 1: Create reverse pickup shipment
            const shipmentResponse = await this.createReversePickup(returnId);
            console.log(`✅ Step 1 complete: Reverse pickup shipment created - ID: ${shipmentResponse.shipment_id}`);
            
            // Step 2: Process reverse pickup (assign AWB + schedule pickup)
            // This step might fail if courier needs to be manually selected
            let processResponse;
            try {
                processResponse = await this.processReversePickup(returnId);
                console.log(`✅ Step 2 complete: Courier assigned and pickup scheduled - AWB: ${processResponse.awbCode}`);
                
                return {
                    success: true,
                    shipmentId: shipmentResponse.shipment_id,
                    awbCode: processResponse.awbCode,
                    courier: processResponse.courier,
                    trackingUrl: processResponse.trackingUrl,
                    fullyAutomated: true
                };
            } catch (processingError) {
                console.warn(`⚠️  Step 2 failed (courier assignment): ${processingError.message}`);
                console.log(`Reverse pickup created but requires manual courier selection on Shiprocket`);
                
                // Update return with partial success note
                await Return.findByIdAndUpdate(returnId, {
                    '$push': {
                        'adminNotes': {
                            note: `🤖 Reverse pickup shipment created (ID: ${shipmentResponse.shipment_id}). Please assign courier manually on Shiprocket.`,
                            addedAt: new Date()
                        }
                    }
                });
                
                // Return success with note about manual courier selection
                return {
                    success: true,
                    shipmentId: shipmentResponse.shipment_id,
                    awbCode: null,
                    courier: 'Pending manual selection',
                    trackingUrl: null,
                    fullyAutomated: false,
                    requiresManualCourier: true,
                    message: 'Reverse pickup created successfully. Courier assignment requires manual selection on Shiprocket.'
                };
            }
        } catch (error) {
            console.error(`❌ Automated reverse pickup failed for return ${returnId}:`, error);
            
            // Return failure
            return {
                success: false,
                error: error.message,
                requiresManualIntervention: true
            };
        }
    }

    // Update return tracking information
    async updateReturnTrackingInfo(returnId) {
        try {
            await connectDB();
            
            const returnRequest = await Return.findById(returnId);
            if (!returnRequest || !returnRequest.pickup.awbCode) {
                throw new Error('Return or AWB code not found');
            }

            const trackingData = await shiprocket.trackReturnByAWB(returnRequest.pickup.awbCode);

            if (trackingData.status === 200 && trackingData.data?.length > 0) {
                const tracking = trackingData.data[0];
                
                const updateData = {
                    'pickup.currentLocation': tracking.current_status,
                    'pickup.lastUpdateAt': new Date(),
                    'pickup.trackingHistory': tracking.scans?.map(scan => ({
                        activity: scan.activity,
                        location: scan.location,
                        timestamp: new Date(scan.date),
                        statusCode: scan.status_code
                    })) || []
                };

                // Update return status based on tracking
                const statusMapping = {
                    'Delivered': { status: 'received' },
                    'Out for Delivery': { status: 'in_transit' },
                    'In Transit': { status: 'in_transit' },
                    'Picked Up': { status: 'picked_up' },
                    'Cancelled': { status: 'cancelled' }
                };

                const currentStatus = tracking.current_status;
                if (statusMapping[currentStatus]) {
                    updateData['status'] = statusMapping[currentStatus].status;
                }

                if (tracking.edd) {
                    updateData['pickup.estimatedDelivery'] = new Date(tracking.edd);
                }

                await Return.findByIdAndUpdate(returnId, updateData);
                
                return {
                    status: currentStatus,
                    location: tracking.current_status,
                    estimatedDelivery: tracking.edd,
                    trackingHistory: updateData['pickup.trackingHistory']
                };
            }

            throw new Error('No tracking data available for return');
        } catch (error) {
            console.error('Error updating return tracking info:', error);
            throw error;
        }
    }

    // Cancel reverse pickup
    async cancelReversePickup(returnId) {
        try {
            await connectDB();
            
            const returnRequest = await Return.findById(returnId);
            if (!returnRequest || !returnRequest.pickup.awbCode) {
                throw new Error('Return or AWB code not found');
            }

            const response = await shiprocket.cancelReturnPickup(returnRequest.pickup.awbCode);

            if (response.status_code === 1) {
                await Return.findByIdAndUpdate(returnId, {
                    'pickup.pickupStatus': 'cancelled',
                    'status': 'cancelled'
                });

                return { success: true, message: 'Reverse pickup cancelled successfully' };
            } else {
                throw new Error(response.message || 'Failed to cancel reverse pickup');
            }
        } catch (error) {
            console.error('Error cancelling reverse pickup:', error);
            throw error;
        }
    }
}

const reversePickupService = new ReversePickupService();
export { reversePickupService };