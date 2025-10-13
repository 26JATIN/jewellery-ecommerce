import connectDB from '@/lib/mongodb';
import Gallery from '@/models/Gallery';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Middleware to check admin access
async function checkAdminAccess() {
    try {
        const cookieStore = await cookies();
        const token = await cookieStore.get('token');

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

        return null;
    } catch (error) {
        console.error('Admin auth error:', error);
        return { error: 'Internal server error', status: 500 };
    }
}

// GET all gallery items
export async function GET(request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('activeOnly') === 'true';
        
        const filter = activeOnly ? { isActive: true } : {};
        const galleryItems = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });
        
        return NextResponse.json(galleryItems);
    } catch (error) {
        console.error('Gallery fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch gallery items' },
            { status: 500 }
        );
    }
}

// POST new gallery item (Admin only)
export async function POST(request) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        await connectDB();
        
        const data = await request.json();
        const galleryItem = await Gallery.create(data);
        
        return NextResponse.json(galleryItem, { status: 201 });
    } catch (error) {
        console.error('Gallery creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create gallery item' },
            { status: 500 }
        );
    }
}

// PUT update gallery item (Admin only)
export async function PUT(request) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        await connectDB();
        
        const data = await request.json();
        const { id, ...updateData } = data;
        
        const galleryItem = await Gallery.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!galleryItem) {
            return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
        }
        
        return NextResponse.json(galleryItem);
    } catch (error) {
        console.error('Gallery update error:', error);
        return NextResponse.json(
            { error: 'Failed to update gallery item' },
            { status: 500 }
        );
    }
}

// DELETE gallery item (Admin only)
export async function DELETE(request) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: 'Gallery item ID required' }, { status: 400 });
        }
        
        const galleryItem = await Gallery.findByIdAndDelete(id);
        
        if (!galleryItem) {
            return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Gallery item deleted successfully' });
    } catch (error) {
        console.error('Gallery deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete gallery item' },
            { status: 500 }
        );
    }
}
