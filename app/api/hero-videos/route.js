import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import HeroVideo from '@/models/HeroVideo';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Middleware to check admin access
async function checkAdminAccess() {
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

        await dbConnect();
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

// GET - Fetch all hero videos or a specific one
export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const activeOnly = searchParams.get('activeOnly') === 'true';

        if (id) {
            const video = await HeroVideo.findById(id);
            if (!video) {
                return NextResponse.json(
                    { error: 'Video not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json(video);
        }

        // Fetch all videos
        const query = activeOnly ? { isActive: true } : {};
        const videos = await HeroVideo.find(query).sort({ order: 1, createdAt: -1 });
        
        return NextResponse.json(videos);
    } catch (error) {
        console.error('Error fetching hero videos:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hero videos' },
            { status: 500 }
        );
    }
}

// POST - Create a new hero video (Admin only)
export async function POST(request) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        await dbConnect();

        const data = await request.json();
        const video = await HeroVideo.create(data);

        return NextResponse.json(video, { status: 201 });
    } catch (error) {
        console.error('Error creating hero video:', error);
        return NextResponse.json(
            { error: 'Failed to create hero video' },
            { status: 500 }
        );
    }
}

// PUT - Update a hero video (Admin only)
export async function PUT(request) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        await dbConnect();

        const { id, ...updateData } = await request.json();
        
        if (!id) {
            return NextResponse.json(
                { error: 'Video ID is required' },
                { status: 400 }
            );
        }

        const video = await HeroVideo.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!video) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(video);
    } catch (error) {
        console.error('Error updating hero video:', error);
        return NextResponse.json(
            { error: 'Failed to update hero video' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a hero video (Admin only)
export async function DELETE(request) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Video ID is required' },
                { status: 400 }
            );
        }

        const video = await HeroVideo.findByIdAndDelete(id);

        if (!video) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting hero video:', error);
        return NextResponse.json(
            { error: 'Failed to delete hero video' },
            { status: 500 }
        );
    }
}
