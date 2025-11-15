import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(req) {
    try {
        await connectDB();
        const { name, phone, email, password } = await req.json();

        if (!name || !phone || !password) {
            return NextResponse.json(
                { error: 'Name, phone number, and password are required' },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Phone number already registered' },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            name,
            phone,
            email: email || null,
            password: hashedPassword
        });

        return NextResponse.json({
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}