import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

/**
 * Auth Check Route
 * Used by AuthContext to verify user authentication status on app load
 * Validates JWT token from cookies and returns user data if valid
 * This route is critical for maintaining authentication state across page reloads
 */
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ 
                authenticated: false,
                reason: 'No token provided' 
            }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            // Clear invalid token
            const response = NextResponse.json({ 
                authenticated: false,
                reason: 'Invalid token' 
            }, { status: 401 });
            
            response.cookies.delete('token');
            return response;
        }

        // Connect to DB and fetch full user data
        await connectDB();
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            // Clear token for non-existent user
            const response = NextResponse.json({ 
                authenticated: false,
                reason: 'User not found' 
            }, { status: 401 });
            
            response.cookies.delete('token');
            return response;
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin || false,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        
        // Clear potentially corrupted token
        const response = NextResponse.json({ 
            authenticated: false,
            reason: 'Authentication error' 
        }, { status: 500 });
        
        response.cookies.delete('token');
        return response;
    }
}