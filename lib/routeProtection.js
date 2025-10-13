import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

/**
 * Protect API routes - requires authentication
 * Returns { user, error } where error is null on success
 */
export async function protectRoute(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return {
                user: null,
                error: NextResponse.json(
                    { error: 'Unauthorized - Authentication required' },
                    { status: 401 }
                )
            };
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            const response = NextResponse.json(
                { error: 'Unauthorized - Invalid token' },
                { status: 401 }
            );
            response.cookies.delete('token');
            
            return {
                user: null,
                error: response
            };
        }

        await connectDB();
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            const response = NextResponse.json(
                { error: 'Unauthorized - User not found' },
                { status: 401 }
            );
            response.cookies.delete('token');
            
            return {
                user: null,
                error: response
            };
        }

        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin || false
            },
            error: null
        };
    } catch (error) {
        console.error('Route protection error:', error);
        return {
            user: null,
            error: NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        };
    }
}

/**
 * Protect admin API routes - requires admin privileges
 * Returns { user, error } where error is null on success
 */
export async function protectAdminRoute(request) {
    const { user, error } = await protectRoute(request);
    
    if (error) {
        return { user: null, error };
    }
    
    if (!user.isAdmin) {
        return {
            user: null,
            error: NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            )
        };
    }
    
    return { user, error: null };
}

/**
 * Get current user from request (no protection, just info)
 * Returns user or null
 */
export async function getCurrentUser(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return null;
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            return null;
        }

        await connectDB();
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return null;
        }

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin || false
        };
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

const routeProtection = {
    protectRoute,
    protectAdminRoute,
    getCurrentUser
};

export default routeProtection;
