import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { rateLimit, getClientIP } from '@/lib/rateLimit';

export async function POST(req) {
    try {
        // Rate limiting: 3 registration attempts per hour per IP
        const clientIP = getClientIP(req);
        const rateLimitResult = rateLimit(`register_${clientIP}`, 3, 60 * 60 * 1000);
        
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { 
                    error: `Too many registration attempts. Please try again in ${Math.ceil(rateLimitResult.waitTime / 60)} minutes.`,
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
        const { name, email, password } = await req.json();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        return NextResponse.json({
            message: 'User created successfully'
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}