import { NextResponse } from 'next/server';
import { getShiprocketToken } from '@/lib/shiprocketAuth';

export async function POST() {
    try {
        const token = await getShiprocketToken();
        return NextResponse.json({ token });
    } catch (error) {
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 401 }
        );
    }
}