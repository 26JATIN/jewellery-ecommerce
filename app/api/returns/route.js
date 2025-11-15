import connectDB from '@/lib/mongodb';
import ReturnModel from '@/models/Return';
import Order from '@/models/Order';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { orderId, items, reason, refundDetails, notes } = body;

        if (!orderId) return NextResponse.json({ error: 'orderId is required' }, { status: 400 });

        await connectDB();

        const order = await Order.findById(orderId);
        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        if (String(order.userId) !== user.userId) return NextResponse.json({ error: 'Not authorized for this order' }, { status: 403 });

        // Check if order is eligible for return (must be delivered)
        if (order.status !== 'delivered') {
            return NextResponse.json({ error: 'Only delivered orders can be returned' }, { status: 400 });
        }

        // Check if return already exists for this order
        const existingReturn = await ReturnModel.findOne({ 
            orderId: order._id,
            status: { $nin: ['cancelled', 'completed'] } // Allow new return if previous was cancelled/completed
        });

        if (existingReturn) {
            return NextResponse.json({ 
                error: 'A return request already exists for this order',
                returnNumber: existingReturn.returnNumber
            }, { status: 400 });
        }

        // Create return record
        const returnDoc = new ReturnModel({
            orderId: order._id,
            userId: user.userId,
            items: items || [],
            status: 'requested',
            refundDetails: refundDetails || {},
            notes: notes || ''
        });

        await returnDoc.save();

        // Create Shiprocket return order
        try {
            const { createReturnOrder, processShipment, generatePickup } = await import('@/lib/shiprocket');

            // Prepare return items for Shiprocket
            const shiprocketReturnItems = items.map(item => ({
                name: item.name,
                sku: `RETURN-${item.productId}`,
                units: item.quantity,
                selling_price: order.items.find(oi => String(oi.productId) === String(item.productId))?.price || 0,
                discount: 0,
                tax: 0,
                hsn: '',
            }));

            // Calculate total weight
            const totalWeight = items.reduce((sum, item) => sum + (item.quantity * 0.05), 0);

            const returnOrderData = {
                orderId: `RETURN-${order.orderNumber}`,
                shipmentId: order.shiprocketShipmentId,
                orderDate: new Date().toISOString().split('T')[0],
                pickupCustomerName: order.shippingAddress.fullName,
                pickupAddress: order.shippingAddress.addressLine1 + (order.shippingAddress.addressLine2 ? ', ' + order.shippingAddress.addressLine2 : ''),
                pickupCity: order.shippingAddress.city,
                pickupPincode: order.shippingAddress.pincode,
                pickupState: order.shippingAddress.state,
                pickupEmail: user.email || 'customer@nandikajewellers.com',
                pickupPhone: order.shippingAddress.phone,
                returnItems: shiprocketReturnItems,
                weight: totalWeight,
                length: 15,
                breadth: 15,
                height: 10,
            };

            const shiprocketResponse = await createReturnOrder(returnOrderData);

            // Update return document with Shiprocket details
            if (shiprocketResponse.order_id) {
                returnDoc.shiprocketReturnId = shiprocketResponse.order_id;
                returnDoc.shiprocketReturnShipmentId = shiprocketResponse.shipment_id;
                returnDoc.status = 'pickup_scheduled';

                // Automatically trigger "Ship Now" for return pickup
                try {
                    console.log(`🚚 Processing return shipment (Ship Now) for return ${returnDoc._id}...`);
                    const processResponse = await processShipment(shiprocketResponse.shipment_id);
                    console.log(`✅ Ship Now processed for return ${returnDoc._id}:`, processResponse);
                    
                    // Step 2: Generate Pickup Request for return
                    try {
                        console.log(`📦 Generating return pickup request for return ${returnDoc._id}...`);
                        const pickupResponse = await generatePickup(shiprocketResponse.shipment_id);
                        console.log(`✅ Return pickup request generated for return ${returnDoc._id}:`, pickupResponse);
                    } catch (pickupError) {
                        console.error(`⚠️ Failed to generate return pickup for return ${returnDoc._id}:`, pickupError);
                        // Don't fail - can be done manually
                    }
                } catch (shipNowError) {
                    console.error(`⚠️ Failed to process Ship Now for return ${returnDoc._id}:`, shipNowError);
                    // Don't fail if Ship Now fails - can be done manually
                }

                // Persist return
                await returnDoc.save();
                console.log(`Shiprocket return created: ${shiprocketResponse.order_id} for return ${returnDoc._id}`);
            }
        } catch (shiprocketError) {
            console.error('Shiprocket return creation failed:', shiprocketError);
            // Don't fail the entire return request if Shiprocket fails
            // Admin can manually create return shipment later
        }

        return NextResponse.json({ success: true, returnId: returnDoc._id });
    } catch (error) {
        console.error('Create return error:', error);
        return NextResponse.json({ error: 'Failed to create return', details: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();
        // Return list of user's returns
        const returns = await ReturnModel.find({ userId: user.userId }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, returns });
    } catch (error) {
        console.error('List returns error:', error);
        return NextResponse.json({ error: 'Failed to fetch returns', details: error.message }, { status: 500 });
    }
}
