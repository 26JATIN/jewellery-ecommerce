import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

// GET /api/admin/coupons - Get all coupons
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status'); // 'active', 'expired', 'all'
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    const now = new Date();
    
    if (status === 'active') {
      query = {
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now }
      };
    } else if (status === 'expired') {
      query = {
        $or: [
          { validUntil: { $lt: now } },
          { isActive: false },
          { $expr: { $gte: ['$usedCount', '$usageLimit'] } }
        ]
      };
    }
    
    const coupons = await Coupon.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalCoupons = await Coupon.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: {
        coupons,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCoupons / limit),
          totalCoupons,
          hasNext: page < Math.ceil(totalCoupons / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/admin/coupons - Create new coupon
export async function POST(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['code', 'description', 'discountType', 'discountValue', 'validUntil'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }
    
    // Validate discount value
    if (data.discountType === 'percentage' && data.discountValue > 100) {
      return NextResponse.json({
        success: false,
        error: 'Percentage discount cannot exceed 100%'
      }, { status: 400 });
    }
    
    // Validate dates
    const validFrom = new Date(data.validFrom || Date.now());
    const validUntil = new Date(data.validUntil);
    
    if (validUntil <= validFrom) {
      return NextResponse.json({
        success: false,
        error: 'Valid until date must be after valid from date'
      }, { status: 400 });
    }
    
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ 
      code: data.code.toUpperCase() 
    });
    
    if (existingCoupon) {
      return NextResponse.json({
        success: false,
        error: 'Coupon code already exists'
      }, { status: 400 });
    }
    
    // Create coupon
    const couponData = {
      ...data,
      code: data.code.toUpperCase(),
      validFrom,
      validUntil,
      createdBy: data.createdBy || '507f1f77bcf86cd799439011' // Default admin ID
    };
    
    const coupon = new Coupon(couponData);
    await coupon.save();
    
    await coupon.populate('createdBy', 'name email');
    
    return NextResponse.json({
      success: true,
      data: coupon,
      message: 'Coupon created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating coupon:', error);
    
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: 'Coupon code already exists'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}