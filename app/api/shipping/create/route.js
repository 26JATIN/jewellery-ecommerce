import { NextResponse } from 'next/server';

/**
 * MANUAL SHIPMENT CREATION DISABLED
 * 
 * All shipments are created automatically after payment success.
 * See: /lib/orderAutomationService.js for automation logic
 * 
 * Automation Flow:
 * Payment Success → orderAutomationService.processNewOrder() 
 * → shippingService.automateShipping() → Shipment Created
 * 
 * Configuration: 
 * - AUTO_SHIP_ENABLED=true (in .env)
 * - AUTO_SHIP_DELAY_MINUTES=0 (instant)
 */

export async function POST(req) {
    return NextResponse.json({
        error: 'Manual shipment creation is disabled',
        message: '✨ Shipments are created automatically after payment!',
        automation: {
            enabled: true,
            trigger: 'Payment success',
            delay: '0 minutes (instant)',
            status: 'Fully automated'
        },
        documentation: [
            '/lib/orderAutomationService.js',
            '/lib/shippingService.js',
            '/app/api/payment/verify/route.js'
        ]
    }, { status: 403 });
}
