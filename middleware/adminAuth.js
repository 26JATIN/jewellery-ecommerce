import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Enhanced admin authentication middleware
 * Returns null if authorized, or NextResponse with error if unauthorized
 * Also returns the authenticated user object on success
 */
export async function adminAuth(req) {
    try {
        const token = req.cookies.get('token')?.value;
        
        if (!token) {
            console.log('Admin auth failed: No token provided');
            return NextResponse.json(
                { 
                    error: 'Unauthorized - Authentication required',
                    code: 'NO_TOKEN' 
                },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            console.log('Admin auth failed: Invalid token');
            const response = NextResponse.json(
                { 
                    error: 'Unauthorized - Invalid token',
                    code: 'INVALID_TOKEN' 
                },
                { status: 401 }
            );
            // Clear invalid token
            response.cookies.delete('token');
            return response;
        }

        await connectDB();
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            console.log('Admin auth failed: User not found');
            const response = NextResponse.json(
                { 
                    error: 'Unauthorized - User not found',
                    code: 'USER_NOT_FOUND' 
                },
                { status: 401 }
            );
            // Clear token for non-existent user
            response.cookies.delete('token');
            return response;
        }

        if (!user.isAdmin) {
            console.log(`Admin auth failed: User ${user.email} is not an admin`);
            return NextResponse.json(
                { 
                    error: 'Forbidden - Admin access required',
                    code: 'NOT_ADMIN' 
                },
                { status: 403 }
            );
        }

        // Success - return null and attach user to request
        // In API routes, you can call adminAuth and access the user
        return { user, error: null };
    } catch (error) {
        console.error('Admin auth error:', error);
        return NextResponse.json(
            { 
                error: 'Internal server error',
                code: 'SERVER_ERROR' 
            },
            { status: 500 }
        );
    }
}

/**
 * Simplified admin check that only returns error response
 * Use this when you don't need the user object
 */
export async function checkAdminAuth(req) {
    const result = await adminAuth(req);
    if (result && result.error === null) {
        return null; // Authorized
    }
    return result; // Return error response
}