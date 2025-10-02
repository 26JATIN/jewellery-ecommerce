import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SignJWT, jwtVerify } from 'jose';

export async function hashPassword(password) {
    return await hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
    return await compare(password, hashedPassword);
}

export function generateToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

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

// Edge runtime compatible token verification
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