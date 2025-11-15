import { verifyAuth } from '@/lib/auth';
import Order from '@/models/Order';
import dbConnect from '@/lib/mongodb';
import shiprocket from '@/lib/shiprocket';

export async function GET(request, { params }) {
    try {
        // Await params (Next.js 15 requirement)
        const { id } = await params;
        
        // Verify user is authenticated
        const user = await verifyAuth(request);
        if (!user) {
            return Response.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Find order and verify it belongs to the user
        const order = await Order.findById(id);
        if (!order) {
            return Response.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if user owns this order
        if (order.userId.toString() !== user.userId) {
            return Response.json(
                { error: 'You do not have access to this order' },
                { status: 403 }
            );
        }

        // Check if order has Shiprocket order ID
        if (!order.shiprocketOrderId) {
            return Response.json(
                { error: 'Invoice not available - order not yet shipped' },
                { status: 400 }
            );
        }

        // Generate invoice using Shiprocket
        const invoiceResult = await shiprocket.printInvoice([order.shiprocketOrderId]);
        
        if (!invoiceResult || !invoiceResult.invoice_url) {
            return Response.json(
                { error: 'Failed to generate invoice' },
                { status: 500 }
            );
        }

        return Response.json({
            success: true,
            invoiceUrl: invoiceResult.invoice_url
        });

    } catch (error) {
        console.error('Invoice generation error:', error);
        return Response.json(
            { error: 'Failed to generate invoice', details: error.message },
            { status: 500 }
        );
    }
}
