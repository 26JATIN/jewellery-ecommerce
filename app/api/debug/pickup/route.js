import { NextResponse } from 'next/server';
import { shiprocket } from '@/lib/shiprocket';

export async function GET() {
    try {
        // Check pickup locations
        const pickupLocations = await shiprocket.makeRequest('/external/settings/company/pickup');
        
        return NextResponse.json({
            success: true,
            data: {
                pickupLocations: pickupLocations
            }
        });
    } catch (error) {
        console.error('Pickup locations error:', error);
        return NextResponse.json(
            { 
                success: false,
                error: error.message,
                details: 'Failed to get pickup locations'
            },
            { status: 500 }
        );
    }
}