import { NextResponse } from 'next/server';
import { shiprocket } from '@/lib/shiprocket';

export async function POST() {
    try {
        const token = await shiprocket.authenticate();
        return NextResponse.json({ token });
    } catch (error) {
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 401 }
        );
    }
}