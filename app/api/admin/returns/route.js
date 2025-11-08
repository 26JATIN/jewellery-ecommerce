import connectDB from '@/lib/mongodb';
import ReturnModel from '@/models/Return';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const user = await verifyAuth(request);
        if (!user || !user.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        await connectDB();

        const query = {};
        const total = await ReturnModel.countDocuments(query);
        const returns = await ReturnModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('orderId')
            .populate('userId');

        return NextResponse.json({ success: true, returns, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Admin list returns error:', error);
        return NextResponse.json({ error: 'Failed to list returns', details: error.message }, { status: 500 });
    }
}
