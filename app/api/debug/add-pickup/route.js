import { NextResponse } from 'next/server';
import { shiprocket } from '@/lib/shiprocket';

export async function POST() {
    try {
        // Add pickup address to Shiprocket account
        const pickupAddressData = {
            pickup_location: "Rajpura_Store",
            name: "Vedansh Sharma",
            email: "developer2005.tca@gmail.com",
            phone: "6230378893",
            address: "House No. 123, Rajpura",
            address_2: "Rajpura, Patiala Punjab",
            city: "Rajpura",
            state: "Punjab",
            country: "India",
            pin_code: "140401"
        };

        console.log('Adding pickup address:', JSON.stringify(pickupAddressData, null, 2));

        const response = await shiprocket.makeRequest('/external/settings/company/addpickup', {
            method: 'POST',
            body: pickupAddressData
        });

        return NextResponse.json({
            success: true,
            message: 'Pickup address added successfully',
            data: response
        });
    } catch (error) {
        console.error('Add pickup address error:', error);
        return NextResponse.json(
            { 
                success: false,
                error: error.message,
                details: 'Failed to add pickup address'
            },
            { status: 500 }
        );
    }
}