import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        
        if (!cloudName) {
            return NextResponse.json(
                { error: 'Cloudinary cloud name not configured' },
                { status: 500 }
            );
        }
        
        return NextResponse.json({ cloudName });
    } catch (error) {
        console.error('Config fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch config' },
            { status: 500 }
        );
    }
}
