import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import Product from '@/models/Product';

// POST /api/coupons/validate - Validate coupon code
export async function POST(request) {
  try {
    await connectDB();
    
    const { couponCode, cartItems, userId } = await request.json();
    
    if (!couponCode) {
      return NextResponse.json({
        success: false,
        error: 'Coupon code is required'
      }, { status: 400 });
    }
    
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Cart is empty'
      }, { status: 400 });
    }
    
    // Find coupon
    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      isActive: true 
    });
    
    if (!coupon) {
      return NextResponse.json({
        success: false,
        error: 'Invalid coupon code'
      }, { status: 404 });
    }
    
    // Check if coupon is currently valid
    if (!coupon.isCurrentlyValid) {
      const now = new Date();
      if (coupon.validFrom > now) {
        return NextResponse.json({
          success: false,
          error: 'Coupon is not yet active'
        }, { status: 400 });
      } else if (coupon.validUntil < now) {
        return NextResponse.json({
          success: false,
          error: 'Coupon has expired'
        }, { status: 400 });
      } else if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({
          success: false,
          error: 'Coupon usage limit reached'
        }, { status: 400 });
      }
    }
    
    // Check user usage limit
    if (userId && !coupon.canUserUseCoupon(userId)) {
      return NextResponse.json({
        success: false,
        error: 'You have already used this coupon'
      }, { status: 400 });
    }
    
    // Get full product details for cart items
    const productIds = cartItems.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Enrich cart items with product details
    const enrichedCartItems = cartItems.map(cartItem => {
      const product = products.find(p => p._id.toString() === cartItem.productId);
      return {
        ...cartItem,
        price: product?.price || cartItem.price,
        category: product?.category || cartItem.category,
        name: product?.name || cartItem.name
      };
    });
    
    // Calculate cart total
    const cartTotal = enrichedCartItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    // Calculate discount
    const discountResult = coupon.calculateDiscount(enrichedCartItems, cartTotal);
    
    if (!discountResult.valid) {
      return NextResponse.json({
        success: false,
        error: discountResult.error
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        couponCode: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountResult.discountAmount,
        originalTotal: cartTotal,
        finalTotal: discountResult.finalTotal,
        savings: discountResult.discountAmount
      },
      message: `Coupon applied! You saved ₹${discountResult.discountAmount}`
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}