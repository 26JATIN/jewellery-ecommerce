import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import cloudinary from '@/lib/cloudinary';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Force Node.js runtime for Cloudinary compatibility
export const runtime = 'nodejs';

export async function POST(req) {
    try {
        // Verify admin authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        console.log('Upload API - Token exists:', !!token);

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - No token found' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token.value);
        console.log('Upload API - Decoded token:', decoded ? 'Valid' : 'Invalid');

        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Connect to DB and fetch user data to check admin status
        await connectDB();
        const user = await User.findById(decoded.userId).select('isAdmin');
        
        console.log('Upload API - User found:', !!user);
        console.log('Upload API - User isAdmin:', user?.isAdmin);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 401 }
            );
        }

        if (!user.isAdmin) {
            return NextResponse.json(
                { error: 'Admin access required - User is not admin' },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') || formData.get('image'); // Support both field names
        const folder = formData.get('folder') || 'jewellery-products';

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Detect file type
        const fileType = file.type.startsWith('video/') ? 'video' : 'image';

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadOptions = {
                resource_type: fileType,
                folder: folder,
            };

            // Add transformations only for images
            if (fileType === 'image') {
                uploadOptions.transformation = [
                    { width: 1200, height: 1500, crop: 'limit', quality: 'auto' },
                    { fetch_format: 'auto' }
                ];
            }

            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            ).end(buffer);
        });

        return NextResponse.json({
            success: true,
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id
        });

    } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed: ' + error.message },
            { status: 500 }
        );
    }
}