import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const userData = await User.findById(user.userId).select('addresses');
        
        return NextResponse.json({ 
            addresses: userData?.addresses || [] 
        });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = body;

        if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();
        const userData = await User.findById(user.userId);

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // If this is set as default, unset other defaults
        if (isDefault) {
            userData.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        userData.addresses.push({
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            isDefault: isDefault || userData.addresses.length === 0
        });

        await userData.save();

        return NextResponse.json({ 
            message: 'Address added successfully',
            addresses: userData.addresses 
        });
    } catch (error) {
        console.error('Error adding address:', error);
        return NextResponse.json({ error: 'Failed to add address' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { addressId, isDefault } = body;

        if (!addressId) {
            return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
        }

        await connectDB();
        const userData = await User.findById(user.userId);

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Set new default address
        if (isDefault) {
            userData.addresses.forEach(addr => {
                addr.isDefault = addr._id.toString() === addressId;
            });
            await userData.save();
        }

        return NextResponse.json({ 
            message: 'Address updated successfully',
            addresses: userData.addresses 
        });
    } catch (error) {
        console.error('Error updating address:', error);
        return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const addressId = searchParams.get('id');

        if (!addressId) {
            return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
        }

        await connectDB();
        const userData = await User.findById(user.userId);

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        userData.addresses = userData.addresses.filter(
            addr => addr._id.toString() !== addressId
        );

        // If deleted address was default and there are other addresses, set first as default
        if (userData.addresses.length > 0 && !userData.addresses.some(addr => addr.isDefault)) {
            userData.addresses[0].isDefault = true;
        }

        await userData.save();

        return NextResponse.json({ 
            message: 'Address deleted successfully',
            addresses: userData.addresses 
        });
    } catch (error) {
        console.error('Error deleting address:', error);
        return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
    }
}
