import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Return from '@/models/Return';
import User from '@/models/User';
import Product from '@/models/Product'; // Add missing Product model import
import Order from '@/models/Order'; // Add Order model import as well
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Middleware to check admin authentication
async function checkAdminAuth() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return { error: 'Unauthorized', status: 401 };
        }

        const decoded = verifyToken(token.value);
        if (!decoded) {
            return { error: 'Invalid token', status: 401 };
        }

        await connectDB();
        const user = await User.findById(decoded.userId);

        if (!user || !user.isAdmin) {
            return { error: 'Admin access required', status: 403 };
        }

        return { userId: decoded.userId };
    } catch (error) {
        console.error('Admin auth error:', error);
        return { error: 'Internal server error', status: 500 };
    }
}

// GET: Fetch all returns for admin
export async function GET(req) {
    try {
        const authResult = await checkAdminAuth();
        if (authResult.error) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        await connectDB();

        // Build query
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { returnNumber: { $regex: search, $options: 'i' } },
                { 'items.name': { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Fetch returns with pagination
        const returns = await Return.find(query)
            .populate('order', 'totalAmount createdAt')
            .populate('user', 'name email')
            .populate('items.product', 'name images')
            .sort(sort)
            .limit(limit)
            .skip((page - 1) * limit);

        const totalReturns = await Return.countDocuments(query);
        const totalPages = Math.ceil(totalReturns / limit);

        // Get status counts for dashboard
        const statusCounts = await Return.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusStats = statusCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        return NextResponse.json({
            success: true,
            data: {
                returns,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalReturns,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                stats: {
                    statusCounts: statusStats,
                    totalValue: returns.reduce((sum, ret) => sum + ret.refundDetails.originalAmount, 0)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching admin returns:', error);
        return NextResponse.json(
            { error: 'Failed to fetch returns' },
            { status: 500 }
        );
    }
}