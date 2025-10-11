import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = NextResponse.json({ 
            message: 'Logged out successfully',
            success: true 
        });

        // Clear the auth token cookie with multiple methods for thorough cleanup
        response.cookies.delete('token');
        
        // Also set it to empty with past expiry as backup
        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            expires: new Date(0),
            maxAge: 0
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Logout failed', success: false },
            { status: 500 }
        );
    }
}