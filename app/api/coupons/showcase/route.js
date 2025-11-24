import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import User from '@/models/User';
import Product from '@/models/Product';

// GET /api/coupons/showcase - Get applicable coupons for user
export async function GET(request) {
  try {
    await connectDB();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const cartItemsParam = searchParams.get('cartItems'); // JSON string of cart items
    
    let cartItems = [];
    if (cartItemsParam) {
      try {
        cartItems = JSON.parse(cartItemsParam);
      } catch (e) {
        console.error('Invalid cartItems JSON:', e);
      }
    }

    // Get active coupons that are suitable for showcase
    const currentDate = new Date();
    
    let coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: currentDate },
      validUntil: { $gte: currentDate },
      $or: [
        { usageLimit: { $exists: false } },
        { usageLimit: null },
        { $expr: { $lt: [{ $ifNull: ['$usedCount', 0] }, '$usageLimit'] } }
      ]
    })
    .select('code description discountType discountValue minimumOrderValue maximumDiscountAmount validUntil usageLimit usedCount firstTimeUserOnly applicableMetalType userUsageLimit usageHistory')
    .sort({ 
      firstTimeUserOnly: -1,
      discountValue: -1,
      createdAt: -1
    })
    .lean();

    // Filter coupons based on user and cart
    const applicableCoupons = [];
    
    for (const coupon of coupons) {
      let isApplicable = true;
      
      // Check if user-specific restrictions apply
      if (userId) {
        // Check first-time user restriction
        if (coupon.firstTimeUserOnly) {
          const user = await User.findById(userId).select('_id createdAt');
          if (!user) {
            isApplicable = false;
            continue;
          }
          
          // Check if user has any orders
          const Order = require('@/models/Order').default;
          const hasOrders = await Order.exists({ userId: user._id });
          if (hasOrders) {
            isApplicable = false;
            continue;
          }
        }
        
        // Check user usage limit
        const userUsageCount = coupon.usageHistory?.filter(
          usage => usage.userId?.toString() === userId
        ).length || 0;
        
        if (userUsageCount >= coupon.userUsageLimit) {
          isApplicable = false;
          continue;
        }
      } else if (coupon.firstTimeUserOnly) {
        isApplicable = false;
        continue;
      }
      
      // Check cart-based metal type restrictions
      if (cartItems.length > 0 && coupon.applicableMetalType && coupon.applicableMetalType !== 'all') {
        // Get product details for cart items
        const productIds = cartItems.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } })
          .select('metalType')
          .lean();
        
        // Check if any cart item matches the metal type
        const hasApplicableItems = products.some(product => 
          product.metalType && product.metalType.toLowerCase() === coupon.applicableMetalType.toLowerCase()
        );
        
        if (!hasApplicableItems) {
          isApplicable = false;
          continue;
        }
      }
      
      if (isApplicable) {
        // Remove sensitive data
        delete coupon.usageHistory;
        applicableCoupons.push(coupon);
      }
    }

    // Limit to 6 coupons for display
    const showcaseCoupons = applicableCoupons.slice(0, 6);

    return NextResponse.json({
      success: true,
      coupons: showcaseCoupons
    });

  } catch (error) {
    console.error('Error fetching showcase coupons:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch coupons'
    }, { status: 500 });
  }
}