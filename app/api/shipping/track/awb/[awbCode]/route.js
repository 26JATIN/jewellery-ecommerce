import { NextResponse } from 'next/server';
import { shiprocket } from '@/lib/shiprocket';

export async function GET(req, { params }) {
    try {
        const { awbCode } = params;
        const tracking = await shiprocket.trackByAWB(awbCode);
        
        return NextResponse.json(tracking);
    } catch (error) {
        console.error('AWB tracking error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch AWB tracking info' },
            { status: 500 }
        );
    }
}