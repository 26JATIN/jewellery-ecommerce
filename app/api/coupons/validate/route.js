import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import Product from '@/models/Product';

// POST /api/coupons/validate - Validate coupon code
export async function POST(request) {
  try {
    await connectDB();
    
    const { couponCode, cartItems, userId } = await request.json();
    
    console.log('=== COUPON VALIDATION DEBUG ===');
    console.log('Cart items received:', JSON.stringify(cartItems, null, 2));
    
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
    console.log('Looking for product IDs:', productIds);
    
    const products = await Product.find({ _id: { $in: productIds } })
      .populate('subcategory', '_id name category');
    
    console.log('Products from DB:', products.map(p => ({ id: p._id, name: p.name, metalType: p.metalType })));
    
    // If no products found, try using _id from cart items
    if (products.length === 0) {
      const alternateIds = cartItems.map(item => item._id || item.id);
      console.log('Trying alternate IDs:', alternateIds);
      
      // Check if product exists at all
      const checkProduct = await Product.findById(alternateIds[0]);
      console.log('Direct check for first product:', checkProduct ? {
        id: checkProduct._id,
        name: checkProduct.name,
        metalType: checkProduct.metalType,
        category: checkProduct.category
      } : 'NOT FOUND');
      
      const alternateProducts = await Product.find({ _id: { $in: alternateIds } })
        .populate('subcategory', '_id name category');
      console.log('Alternate products found:', alternateProducts.length);
      products.push(...alternateProducts);
    }
    
    // Enrich cart items with product details including metal type
    const enrichedCartItems = cartItems.map(cartItem => {
      // Cart items can have product data in multiple places:
      // 1. cartItem.product (nested object) - most common
      // 2. Direct properties on cartItem
      // 3. Fetched from database
      const productId = cartItem.productId || cartItem.product?._id || cartItem._id || cartItem.id;
      const product = products.find(p => p._id.toString() === productId?.toString());
      
      // Use nested product data if available, otherwise fetch from DB
      const productData = cartItem.product || product || cartItem;
      
      console.log(`Enriching item:`, {
        cartItemId: productId,
        foundProduct: !!product,
        hasNestedProduct: !!cartItem.product,
        metalType: productData.metalType,
        name: productData.name
      });
      
      return {
        ...cartItem,
        price: productData.sellingPrice || cartItem.price,
        category: productData.category || cartItem.category,
        subcategory: productData.subcategory || cartItem.subcategory,
        metalType: productData.metalType, // Get from nested product or DB product
        name: productData.name || cartItem.name
      };
    });
    
    console.log('Enriched cart items:', enrichedCartItems.map(item => ({ name: item.name, metalType: item.metalType })));
    console.log('Coupon applicable metal type:', coupon.applicableMetalType);
    
    // Calculate cart total
    const cartTotal = enrichedCartItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    // Calculate discount (now async)
    const discountResult = await coupon.calculateDiscount(enrichedCartItems, cartTotal);
    
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