import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Authentication Utilities
 * 
 * Note: For Edge runtime compatible auth (middleware), see lib/auth-edge.js
 */

export async function hashPassword(password) {
    return await hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
    return await compare(password, hashedPassword);
}

/**
 * Generate JWT token (Node.js runtime)
 * Used in API routes for user authentication
 */
export function generateToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

/**
 * Verify JWT token (Node.js runtime)
 * Used in API routes and server components
 */
export function verifyToken(token) {
    try {
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            return null;
        }
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return null;
    }
}

/**
 * Verify authentication from Next.js request
 * Used in API routes to authenticate users
 * Returns user object with userId and isAdmin status
 */
export async function verifyAuth(request) {
    try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return null;
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            return null;
        }

        // Import User model and fetch user data to get isAdmin status
        const connectDB = (await import('./mongodb')).default;
        const User = (await import('../models/User')).default;
        
        await connectDB();
        const user = await User.findById(decoded.userId).select('isAdmin email phone name');
        
        if (!user) {
            return null;
        }

        return {
            userId: decoded.userId,
            isAdmin: user.isAdmin,
            email: user.email,
            phone: user.phone,
            name: user.name
        };
    } catch (error) {
        console.error('Auth verification failed:', error.message);
        return null;
    }
}
