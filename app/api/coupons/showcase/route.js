import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

export async function GET() {
  try {
    await connectDB();

    // Get active coupons that are suitable for showcase
    const currentDate = new Date();
    
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: currentDate },
      validUntil: { $gte: currentDate },
      $or: [
        { usageLimit: { $exists: false } }, // No usage limit
        { $expr: { $lt: [{ $ifNull: ['$usedCount', 0] }, '$usageLimit'] } } // Still has usage left
      ]
    })
    .select('code description discountType discountValue minimumOrderValue maximumDiscountAmount validUntil usageLimit usedCount firstTimeUserOnly applicableCategories')
    .sort({ 
      firstTimeUserOnly: -1, // New user coupons first
      discountValue: -1, // Higher discounts first
      createdAt: -1 // Newer coupons first
    })
    .limit(6); // Show maximum 6 coupons

    return NextResponse.json({
      success: true,
      coupons
    });

  } catch (error) {
    console.error('Error fetching showcase coupons:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch coupons'
    }, { status: 500 });
  }
}