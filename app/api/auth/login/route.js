import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, generateToken } from '@/lib/auth';
import { rateLimit, getClientIP } from '@/lib/rateLimit';

export async function POST(req) {
    try {
        // Rate limiting: 5 login attempts per 15 minutes per IP
        const clientIP = getClientIP(req);
        const rateLimitResult = rateLimit(`login_${clientIP}`, 5, 15 * 60 * 1000);
        
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { 
                    error: `Too many login attempts. Please try again in ${rateLimitResult.waitTime} seconds.`,
                    retryAfter: rateLimitResult.retryAfter
                },
                { 
                    status: 429,
                    headers: {
                        'Retry-After': rateLimitResult.retryAfter.toString()
                    }
                }
            );
        }
        
        await connectDB();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const token = generateToken(user._id);

        if (!token) {
            console.error('Failed to generate token');
            return NextResponse.json(
                { error: 'Authentication failed' },
                { status: 500 }
            );
        }

        const response = NextResponse.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            },
            redirect: user.isAdmin ? '/admin' : '/'
        });

        // Set secure cookie with token
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        // Log successful login (without sensitive data)
        console.log(`User logged in: ${user.email} (Admin: ${user.isAdmin})`);

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}