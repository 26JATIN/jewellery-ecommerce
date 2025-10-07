import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { fetchLiveGoldPrice, calculateJewelryPrice } from '@/lib/goldPrice';

export async function POST(request) {
  try {
    console.log('Starting bulk product price update...');
    
    // Connect to database
    await connectDB();
    
    // Get current gold price
    const goldPriceResult = await fetchLiveGoldPrice('INR');
    if (!goldPriceResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch current gold price'
      }, { status: 500 });
    }

    // The fetchLiveGoldPrice returns the data directly, not nested in a 'data' property
    const currentGoldPrice = goldPriceResult.perGram.gold;
    console.log('Current gold price per gram (INR):', currentGoldPrice);

    // Find all products with dynamic pricing enabled
    const dynamicProducts = await Product.find({ 
      isDynamicPricing: true,
      goldWeight: { $exists: true, $gt: 0 }
    });

    console.log(`Found ${dynamicProducts.length} products with dynamic pricing`);
    
    // Log details of found products for debugging
    if (dynamicProducts.length > 0) {
      console.log('Products found for update:');
      dynamicProducts.forEach(product => {
        console.log(`- ${product.name}: ${product.goldWeight}g, ${product.goldPurity}K, current price: ₹${product.price}`);
      });
    }

    if (dynamicProducts.length === 0) {
      // Check what products exist in database for debugging
      const totalProducts = await Product.countDocuments();
      const productsWithDynamicPricing = await Product.countDocuments({ isDynamicPricing: true });
      const productsWithGoldWeight = await Product.countDocuments({ goldWeight: { $exists: true, $gt: 0 } });
      
      return NextResponse.json({
        success: true,
        message: 'No products with dynamic pricing found',
        updated: 0,
        details: [],
        debug: {
          totalProducts,
          productsWithDynamicPricing,
          productsWithGoldWeight,
          suggestion: 'Run scripts/addDynamicProducts.mjs to add sample products with dynamic pricing'
        }
      });
    }

    const updateResults = [];
    let successCount = 0;
    let errorCount = 0;

    // Update each product
    for (const product of dynamicProducts) {
      try {
        // Calculate new price
        const priceCalculation = await calculateJewelryPrice({
          goldWeight: product.goldWeight,
          goldPurity: product.goldPurity || 22, // Default to 22K
          makingChargePercent: product.makingChargePercent || 15, // Default 15%
          currency: 'INR'
        });

        if (priceCalculation.success) {
          const newPrice = priceCalculation.data.totalPrice;
          const oldPrice = product.price;

          // Update product price
          await Product.findByIdAndUpdate(product._id, {
            price: newPrice,
            lastPriceUpdate: new Date(),
            goldPriceAtUpdate: currentGoldPrice
          });

          updateResults.push({
            productId: product._id.toString(),
            name: product.name,
            oldPrice: oldPrice,
            newPrice: newPrice,
            priceChange: newPrice - oldPrice,
            priceChangePercent: oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice * 100) : 0,
            success: true
          });

          successCount++;
        } else {
          updateResults.push({
            productId: product._id.toString(),
            name: product.name,
            error: priceCalculation.error,
            success: false
          });
          errorCount++;
        }
      } catch (error) {
        console.error(`Error updating product ${product._id}:`, error);
        updateResults.push({
          productId: product._id.toString(),
          name: product.name,
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