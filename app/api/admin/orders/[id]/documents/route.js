import { verifyAuth } from '@/lib/auth';
import Order from '@/models/Order';
import dbConnect from '@/lib/mongodb';
import shiprocket from '@/lib/shiprocket';

export async function GET(request, { params }) {
    try {
        // Await params (Next.js 15 requirement)
        const { id } = await params;
        
        // Verify admin authentication
        const user = await verifyAuth(request);
        if (!user || user.role !== 'admin') {
            return Response.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Find order
        const order = await Order.findById(id);
        if (!order) {
            return Response.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if order has been shipped
        if (!order.shiprocketOrderId || !order.shiprocketShipmentId) {
            return Response.json(
                { error: 'Documents not available - order not yet shipped' },
                { status: 400 }
            );
        }

        const documents = {
            orderId: order._id,
            shiprocketOrderId: order.shiprocketOrderId,
            shiprocketShipmentId: order.shiprocketShipmentId,
            awbCode: order.awbCode || null,
        };

        // Generate all documents in parallel
        const [manifestResult, labelResult, invoiceResult] = await Promise.allSettled([
            shiprocket.printManifest([order.shiprocketOrderId]),
            shiprocket.generateLabel([order.shiprocketShipmentId]),
            shiprocket.printInvoice([order.shiprocketOrderId])
        ]);

        // Process manifest result
        if (manifestResult.status === 'fulfilled' && manifestResult.value?.manifest_url) {
            documents.manifestUrl = manifestResult.value.manifest_url;
        } else {
            documents.manifestError = manifestResult.reason?.message || 'Failed to generate manifest';
        }

        // Process label result
        if (labelResult.status === 'fulfilled' && labelResult.value?.label_url) {
            documents.labelUrl = labelResult.value.label_url;
        } else {
            documents.labelError = labelResult.reason?.message || 'Failed to generate label';
        }

        // Process invoice result
        if (invoiceResult.status === 'fulfilled' && invoiceResult.value?.invoice_url) {
            documents.invoiceUrl = invoiceResult.value.invoice_url;
        } else {
            documents.invoiceError = invoiceResult.reason?.message || 'Failed to generate invoice';
        }

        return Response.json({
            success: true,
            documents
        });

    } catch (error) {
        console.error('Document generation error:', error);
        return Response.json(
            { error: 'Failed to generate documents', details: error.message },
            { status: 500 }
        );
    }
}
