import { NextResponse } from 'next/server';
import { shiprocket } from '@/lib/shiprocket';

export async function POST() {
    try {
        // Get all pickup locations first
        const pickupLocations = await shiprocket.makeRequest('/external/settings/company/pickup');
        
        console.log('Current pickup locations:', JSON.stringify(pickupLocations, null, 2));
        
        // Find the Rajpura_Store location
        const rajpuraLocation = pickupLocations.data.shipping_address?.find(
            addr => addr.pickup_location === 'Rajpura_Store'
        );
        
        if (!rajpuraLocation) {
            throw new Error('Rajpura_Store pickup location not found');
        }
        
        // Set it as primary pickup location
        const response = await shiprocket.makeRequest('/external/settings/company/primary-pickup', {
            method: 'POST',
            body: {
                pickup_id: rajpuraLocation.id
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Primary pickup location updated to Rajpura_Store',
            data: response
        });
    } catch (error) {
        console.error('Set primary pickup error:', error);
        return NextResponse.json(
            { 
                success: false,
                error: error.message,
                details: 'Failed to set primary pickup location'
            },
            { status: 500 }
        );
    }
}