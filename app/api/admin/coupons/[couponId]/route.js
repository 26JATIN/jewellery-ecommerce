import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

// GET /api/admin/coupons/[couponId] - Get specific coupon
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { couponId } = await params;
    
    const coupon = await Coupon.findById(couponId)
      .populate('createdBy', 'name email')
      .populate('applicableProducts', 'name image')
      .populate('excludedProducts', 'name image');
    
    if (!coupon) {
      return NextResponse.json({
        success: false,
        error: 'Coupon not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: coupon
    });

  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT /api/admin/coupons/[couponId] - Update coupon
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { couponId } = await params;
    const data = await request.json();
    
    // Validate dates if provided
    if (data.validFrom && data.validUntil) {
      const validFrom = new Date(data.validFrom);
      const validUntil = new Date(data.validUntil);
      
      if (validUntil <= validFrom) {
        return NextResponse.json({
          success: false,
          error: 'Valid until date must be after valid from date'
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
    
    // Check if coupon code already exists (if code is being changed)
    if (data.code) {
      const existingCoupon = await Coupon.findOne({ 
        code: data.code.toUpperCase(),
        _id: { $ne: couponId }
      });
      
      if (existingCoupon) {
        return NextResponse.json({
          success: false,
          error: 'Coupon code already exists'
        }, { status: 400 });
      }
      
      data.code = data.code.toUpperCase();
    }
    
    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      data,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!coupon) {
      return NextResponse.json({
        success: false,
        error: 'Coupon not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: coupon,
      message: 'Coupon updated successfully'
    });

  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE /api/admin/coupons/[couponId] - Delete coupon
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { couponId } = await params;
    
    const coupon = await Coupon.findByIdAndDelete(couponId);
    
    if (!coupon) {
      return NextResponse.json({
        success: false,
        error: 'Coupon not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}