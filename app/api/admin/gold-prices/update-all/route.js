import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { fetchLiveGoldPrice, calculateJewelryPrice } from '@/lib/goldPrice';

/**
 * @deprecated This route is deprecated. Use /api/admin/products/bulk-price-update instead
 * This route is maintained for backward compatibility only
 * 
 * IMPORTANT: This route will be removed in a future version
 * Please migrate to the new consolidated route: /api/admin/products/bulk-price-update
 */

export async function POST(request) {
  try {
    console.log('Starting bulk product price update...');
    
    // Connect to database
    await connectDB();
    
    // Get current metal prices
    const goldPriceResult = await fetchLiveGoldPrice('INR');
    if (!goldPriceResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch current metal prices'
      }, { status: 500 });
    }

    // The fetchLiveGoldPrice returns the data directly, not nested in a 'data' property
    const currentGoldPrice = goldPriceResult.perGram.gold;
    const currentSilverPrice = goldPriceResult.perGram.silver;
    console.log('Current metal prices (INR):', {
      gold: currentGoldPrice,
      silver: currentSilverPrice
    });

    // Find all products with dynamic pricing enabled (any metal type)
    const dynamicProducts = await Product.find({ 
      $or: [
        { pricingMethod: 'dynamic' },
        { isDynamicPricing: true }
      ]
    });

    console.log(`Found ${dynamicProducts.length} products with dynamic pricing`);
    
    // Log details of found products for debugging
    if (dynamicProducts.length > 0) {
      console.log('Products found for update:');
      dynamicProducts.forEach(product => {
        const metalInfo = product.metalType === 'gold' 
          ? `${product.goldWeight}g Gold ${product.goldPurity}K`
          : product.metalType === 'silver'
          ? `${product.silverWeight}g Silver ${product.silverPurity}`
          : 'Mixed metals';
        console.log(`- ${product.name}: ${metalInfo}, current price: ₹${product.price || 0}`);
      });
    }

    if (dynamicProducts.length === 0) {
      // Check what products exist in database for debugging
      const totalProducts = await Product.countDocuments();
      const productsWithDynamicPricing = await Product.countDocuments({ 
        $or: [{ pricingMethod: 'dynamic' }, { isDynamicPricing: true }]
      });
      
      return NextResponse.json({
        success: true,
        message: 'No products with dynamic pricing found',
        updated: 0,
        details: [],
        debug: {
          totalProducts,
          productsWithDynamicPricing,
          suggestion: 'Enable dynamic pricing for products from the Products section'
        }
      });
    }

    const updateResults = [];
    let successCount = 0;
    let errorCount = 0;

    // Update each product
    for (const product of dynamicProducts) {
      try {
        // Calculate new price based on metal type and specifications
        const priceCalculation = await calculateJewelryPrice({
          goldWeight: product.goldWeight || 0,
          goldPurity: product.goldPurity || 22,
          silverWeight: product.silverWeight || 0,
          silverPurity: product.silverPurity || 999,
          makingChargePercent: product.makingChargePercent || 15,
          stoneValue: product.stoneValue || 0,
          gstPercent: product.gstPercent || 3,
          currency: 'INR'
        });

        if (priceCalculation.success) {
          const newMRP = priceCalculation.breakdown.finalPrice;
          const oldMRP = product.mrp || 0;
          const oldSellingPrice = product.sellingPrice || product.price || 0;

          // Validate the new MRP
          if (!newMRP || newMRP <= 0) {
            console.error(`Invalid MRP calculated for product ${product._id}: ${newMRP}`);
            updateResults.push({
              productId: product._id.toString(),
              name: product.name,
              metalType: product.metalType,
              error: `Invalid MRP calculated: ${newMRP}`,
              success: false
            });
            errorCount++;
            continue;
          }

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
            goldPriceAtUpdate: currentGoldPrice
          });

          console.log(`Updated ${product.name} (${product.metalType}): MRP ₹${oldMRP} → ₹${newMRP}, Selling ₹${oldSellingPrice} → ₹${newSellingPrice}`);

          updateResults.push({
            productId: product._id.toString(),
            name: product.name,
            metalType: product.metalType,
            oldMRP: oldMRP,
            newMRP: newMRP,
            oldSellingPrice: oldSellingPrice,
            newSellingPrice: newSellingPrice,
            discountPercent: discountPercent,
            mrpChange: newMRP - oldMRP,
            mrpChangePercent: oldMRP > 0 ? ((newMRP - oldMRP) / oldMRP * 100) : 0,
            sellingPriceChange: newSellingPrice - oldSellingPrice,
            sellingPriceChangePercent: oldSellingPrice > 0 ? ((newSellingPrice - oldSellingPrice) / oldSellingPrice * 100) : 0,
            success: true
          });

          successCount++;
        } else {
          console.error(`Price calculation failed for product ${product._id}:`, priceCalculation.error);
          updateResults.push({
            productId: product._id.toString(),
            name: product.name,
            metalType: product.metalType,
            error: priceCalculation.error || 'Price calculation failed',
            success: false
          });
          errorCount++;
        }
      } catch (error) {
        console.error(`Error updating product ${product._id}:`, error);
        updateResults.push({
          productId: product._id.toString(),
          name: product.name,
          metalType: product.metalType || 'unknown',
          error: error.message,
          success: false
        });
        errorCount++;
      }
    }

    console.log(`Price update completed: ${successCount} success, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      message: `Updated ${successCount} products successfully`,
      updated: successCount,
      errors: errorCount,
      currentGoldPrice: currentGoldPrice,
      currentSilverPrice: currentSilverPrice,
      details: updateResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in bulk price update:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Failed to update product prices'
    }, { status: 500 });
  }
}