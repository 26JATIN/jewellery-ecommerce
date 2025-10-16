import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SignJWT, jwtVerify } from 'jose';

/**
 * Authentication Utilities
 * 
 * WHY TWO JWT LIBRARIES?
 * - jsonwebtoken: Used in API routes (Node.js runtime) for token generation and verification
 * - jose: Used in middleware (Edge runtime) because jsonwebtoken doesn't work in Edge runtime
 * 
 * Edge Runtime Limitation: Next.js middleware runs in Edge runtime which has limited Node.js APIs
 * The 'jsonwebtoken' package uses Node.js-specific crypto APIs that aren't available in Edge runtime
 * The 'jose' package is designed to work in both Node.js and Edge runtime environments
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
 * Verify JWT token (Edge runtime compatible)
 * Used ONLY in middleware.js which runs in Edge runtime
 * Uses 'jose' library which is Edge runtime compatible
 */
export async function verifyTokenEdge(token) {
    try {
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            return null;
        }
        
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return null;
    }
}