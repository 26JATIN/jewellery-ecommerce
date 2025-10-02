import { NextResponse } from 'next/server';
import { shiprocket } from '@/lib/shiprocket';

export async function GET(req, { params }) {
    try {
        const { id } = params;
        const tracking = await shiprocket.trackByShipmentId(id);
        
        return NextResponse.json(tracking);
    } catch (error) {
        console.error('Tracking fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tracking info' },
            { status: 500 }
        );
    }
}