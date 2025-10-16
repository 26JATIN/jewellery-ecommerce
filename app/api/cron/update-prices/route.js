import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { fetchLiveGoldPrice, calculateJewelryPrice } from '@/lib/goldPrice';

/**
 * Cron job to update all product prices with dynamic pricing
 * This should be called every 10 minutes by a cron service (Vercel Cron, external cron, etc.)
 * 
 * For Vercel Cron, add this to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-prices",
 *     "schedule": "0/10 * * * *"
 *   }]
 * }
 */
export async function GET(request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('⚠️ Unauthorized cron job attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting scheduled product price update...');
    
    // Connect to database
    await connectDB();
    
    // Get current metal prices (force fresh fetch, bypass cache)
    const goldPriceResult = await fetchLiveGoldPrice('INR');
    if (!goldPriceResult.success) {
      console.error('❌ Failed to fetch current metal prices');
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch current metal prices'
      }, { status: 500 });
    }

    const currentGoldPrice = goldPriceResult.perGram.gold;
    const currentSilverPrice = goldPriceResult.perGram.silver;
    console.log('💰 Current metal prices (INR):', {
      gold: currentGoldPrice,
      silver: currentSilverPrice
    });

    // Find all products with dynamic pricing enabled
    const dynamicProducts = await Product.find({ 
      $or: [
        { pricingMethod: 'dynamic' },
        { isDynamicPricing: true }
      ]
    });

    console.log(`📦 Found ${dynamicProducts.length} products with dynamic pricing`);
    
    if (dynamicProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No products with dynamic pricing found',
        updated: 0,
        timestamp: new Date().toISOString()
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
            console.error(`❌ Invalid MRP calculated for ${product.name}: ${newMRP}`);
            errorCount++;
            continue;
          }

          // Calculate new selling price using the discount percentage
          const discountPercent = product.discountPercent || 0;
          const discountMultiplier = 1 - (discountPercent / 100);
          const newSellingPrice = newMRP * discountMultiplier;

          // Only update if price has changed significantly (more than ₹1 difference)
          const mrpDiff = Math.abs(newMRP - oldMRP);
          const sellingPriceDiff = Math.abs(newSellingPrice - oldSellingPrice);
          
          if (mrpDiff < 1 && sellingPriceDiff < 1) {
            console.log(`⏭️  Skipping ${product.name} - no significant price change`);
            continue;
          }

          // Update product prices
          await Product.findByIdAndUpdate(product._id, {
            mrp: newMRP,
            sellingPrice: newSellingPrice,
            price: newSellingPrice,
            lastPriceUpdate: new Date(),
            goldPriceAtUpdate: currentGoldPrice,
            silverPriceAtUpdate: currentSilverPrice
          });

          console.log(`✅ Updated ${product.name}: MRP ₹${oldMRP.toFixed(2)} → ₹${newMRP.toFixed(2)}, Selling ₹${oldSellingPrice.toFixed(2)} → ₹${newSellingPrice.toFixed(2)}`);

          updateResults.push({
            productId: product._id.toString(),
            name: product.name,
            metalType: product.metalType,
            oldMRP: oldMRP,
            newMRP: newMRP,
            oldSellingPrice: oldSellingPrice,
            newSellingPrice: newSellingPrice,
            mrpChange: newMRP - oldMRP,
            sellingPriceChange: newSellingPrice - oldSellingPrice
          });

          successCount++;
        } else {
          console.error(`❌ Price calculation failed for ${product.name}:`, priceCalculation.error);
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${product.name}:`, error.message);
        errorCount++;
      }
    }

    const result = {
      success: true,
      message: `Cron job completed: Updated ${successCount} products, ${errorCount} errors`,
      updated: successCount,
      errors: errorCount,
      totalProducts: dynamicProducts.length,
      timestamp: new Date().toISOString(),
      currentPrices: {
        gold: currentGoldPrice,
        silver: currentSilverPrice
      },
      updates: updateResults.slice(0, 20) // Return first 20 updates
    };

    console.log('✅ Cron job completed:', result.message);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Support POST method as well for manual triggering
export async function POST(request) {
  return GET(request);
}
