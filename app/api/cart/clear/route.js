import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function DELETE(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token.value);
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        await connectDB();
        await Cart.findOneAndDelete({ user: decoded.userId });

        return NextResponse.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Clear cart error:', error);
        return NextResponse.json(
            { error: 'Failed to clear cart' },
            { status: 500 }
        );
    }
}