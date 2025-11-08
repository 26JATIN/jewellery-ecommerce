import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ReturnModel from '@/models/Return';
import Order from '@/models/Order';

export async function GET(request) {
    try {
        await dbConnect();

        // Get all returns with their details
        const returns = await ReturnModel.find({})
            .populate('orderId', 'orderNumber shiprocketOrderId')
            .select('returnNumber status shiprocketReturnAwb shiprocketReturnShipmentId courierName createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        const totalReturns = await ReturnModel.countDocuments();
        
        const returnsWithShiprocket = await ReturnModel.countDocuments({
            $or: [
                { shiprocketReturnAwb: { $exists: true, $ne: null } },
                { shiprocketReturnShipmentId: { $exists: true, $ne: null } }
            ]
        });

        return NextResponse.json({
            success: true,
            data: {
                totalReturns,
                returnsWithShiprocket,
                returns: returns.map(r => ({
                    returnNumber: r.returnNumber,
                    status: r.status,
                    shiprocketReturnAwb: r.shiprocketReturnAwb || 'NOT SET',
                    shiprocketReturnShipmentId: r.shiprocketReturnShipmentId || 'NOT SET',
                    courierName: r.courierName || 'NOT SET',
                    linkedOrder: r.orderId?.orderNumber || 'NOT LINKED',
                    linkedShiprocketOrderId: r.orderId?.shiprocketOrderId || 'NOT SET',
                    createdAt: r.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Error checking returns:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
