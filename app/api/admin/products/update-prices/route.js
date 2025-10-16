import { NextResponse } from 'next/server';
import { adminAuth } from '@/middleware/adminAuth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { calculateJewelryPrice } from '@/lib/goldPrice';

/**
 * @deprecated This route is deprecated. Use /api/admin/products/bulk-price-update instead
 * This route is maintained for backward compatibility only
 * 
 * IMPORTANT: This route will be removed in a future version
 * Please migrate to the new consolidated route: /api/admin/products/bulk-price-update
 */

export async function POST(request) {
  try {
    // Verify admin authentication
    const authError = await adminAuth(request);
    if (authError) {
      return authError;
    }

    await connectDB();

    const body = await request.json();
    const { productIds, currency = 'INR' } = body;

    let productsToUpdate;

    if (productIds && productIds.length > 0) {
      // Update specific products
      productsToUpdate = await Product.find({
        _id: { $in: productIds },
        $or: [
          { pricingMethod: 'dynamic' },
          { isDynamicPricing: true }
        ]
      });
    } else {
      // Update all products with dynamic pricing enabled
      productsToUpdate = await Product.find({
        $or: [
          { pricingMethod: 'dynamic' },
          { isDynamicPricing: true }
        ]
      });
    }

    if (productsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No products found with dynamic pricing enabled',
        updated: 0
      });
    }

    const updateResults = [];
    const errors = [];

    for (const product of productsToUpdate) {
      try {
        const calculation = await calculateJewelryPrice({
          goldWeight: product.goldWeight || 0,
          goldPurity: product.goldPurity || 22,
          silverWeight: product.silverWeight || 0,
          silverPurity: product.silverPurity || 999,
          makingChargePercent: product.makingChargePercent || 15,
          stoneValue: product.stoneValue || 0,
          gstPercent: 3, // Default GST
          currency
        });

        if (calculation.success) {
          const newMRP = calculation.breakdown.finalPrice;
          const oldMRP = product.mrp;
          const oldSellingPrice = product.sellingPrice;

          // Calculate new selling price using the discount percentage
          const discountPercent = product.discountPercent || 0;
          const discountMultiplier = 1 - (discountPercent / 100);
          const newSellingPrice = newMRP * discountMultiplier;

          // Update product prices (MRP auto-calculated, selling price = MRP - discount%, cost price unchanged)
          await Product.findByIdAndUpdate(product._id, {
            mrp: newMRP,
            sellingPrice: newSellingPrice,
            price: newSellingPrice, // For backward compatibility
            // Don't update costPrice - it's manually entered by admin
            // Don't update discountPercent - it's manually set by admin
            lastPriceUpdate: new Date(),
            $push: {
              priceHistory: {
                date: new Date(),
                goldPrice: calculation.goldPriceData?.perGram?.gold || 0,
                calculatedPrice: newMRP,
                finalPrice: newSellingPrice
              }
            }
          });

          updateResults.push({
            productId: product._id,
            name: product.name,
            metalType: product.metalType,
            oldMRP,
            newMRP,
            oldSellingPrice,
            newSellingPrice,
            discountPercent,
            mrpChange: newMRP - oldMRP,
            mrpChangePercent: oldMRP > 0 ? ((newMRP - oldMRP) / oldMRP * 100).toFixed(2) : '0',
            sellingPriceChange: newSellingPrice - oldSellingPrice,
            sellingPriceChangePercent: oldSellingPrice > 0 ? ((newSellingPrice - oldSellingPrice) / oldSellingPrice * 100).toFixed(2) : '0'
          });
        } else {
          errors.push({
            productId: product._id,
            name: product.name,
            error: calculation.error
          });
        }
      } catch (error) {
        errors.push({
          productId: product._id,
          name: product.name,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updateResults.length} products`,
      updated: updateResults.length,
      errors: errors.length,
      results: updateResults,
      errorDetails: errors
    });

  } catch (error) {
    console.error('Bulk price update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Verify admin authentication
    const authError = await adminAuth(request);
    if (authError) {
      return authError;
    }

    await connectDB();

    // Get products with dynamic pricing enabled
    const dynamicProducts = await Product.find({
      $or: [
        { pricingMethod: 'dynamic' },
        { isDynamicPricing: true }
      ]
    }).select('name sku metalType goldWeight goldPurity silverWeight silverPurity makingChargePercent stoneValue lastPriceUpdate sellingPrice');

    return NextResponse.json({
      success: true,
      products: dynamicProducts,
      count: dynamicProducts.length
    });

  } catch (error) {
    console.error('Get dynamic products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}