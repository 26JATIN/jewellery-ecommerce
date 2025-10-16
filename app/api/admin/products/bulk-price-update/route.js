import { NextResponse } from 'next/server';
import { adminAuth } from '@/middleware/adminAuth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { fetchLiveGoldPrice, calculateJewelryPrice } from '@/lib/goldPrice';

/**
 * CONSOLIDATED PRICE UPDATE ROUTE
 * Single source of truth for updating product prices based on live metal rates
 * Replaces both:
 * - /api/admin/gold-prices/update-all/route.js
 * - /api/admin/products/update-prices/route.js
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
    const { productIds, currency = 'INR', dryRun = false } = body;

    // Fetch current metal prices
    console.log('🔄 Fetching current metal prices...');
    const goldPriceResult = await fetchLiveGoldPrice(currency);
    
    if (!goldPriceResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch current metal prices'
      }, { status: 500 });
    }

    const currentGoldPrice = goldPriceResult.perGram.gold;
    const currentSilverPrice = goldPriceResult.perGram.silver;
    
    console.log(`💰 Current metal prices (${currency}):`, {
      gold: currentGoldPrice,
      silver: currentSilverPrice,
      source: goldPriceResult.source,
      timestamp: goldPriceResult.lastUpdated
    });

    // Build query for products to update
    let query = {
      $or: [
        { pricingMethod: 'dynamic' },
        { isDynamicPricing: true }
      ]
    };

    // If specific product IDs provided, filter by them
    if (productIds && productIds.length > 0) {
      query._id = { $in: productIds };
    }

    // Find all products with dynamic pricing
    const productsToUpdate = await Product.find(query);

    console.log(`📦 Found ${productsToUpdate.length} products with dynamic pricing`);

    if (productsToUpdate.length === 0) {
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

    // Log products being updated
    if (productsToUpdate.length > 0 && productsToUpdate.length <= 10) {
      console.log('📝 Products to update:');
      productsToUpdate.forEach(product => {
        const metalInfo = product.metalType === 'gold' 
          ? `${product.goldWeight}g Gold ${product.goldPurity}K`
          : product.metalType === 'silver'
          ? `${product.silverWeight}g Silver ${product.silverPurity}`
          : 'Mixed metals';
        console.log(`  - ${product.name}: ${metalInfo}, current MRP: ₹${product.mrp || 0}`);
      });
    }

    const updateResults = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each product
    for (const product of productsToUpdate) {
      try {
        // Calculate new price based on current metal rates
        const priceCalculation = await calculateJewelryPrice({
          goldWeight: product.goldWeight || 0,
          goldPurity: product.goldPurity || 22,
          silverWeight: product.silverWeight || 0,
          silverPurity: product.silverPurity || 999,
          makingChargePercent: product.makingChargePercent || 15,
          stoneValue: product.stoneValue || 0,
          gstPercent: 3, // Standard GST for jewelry in India
          currency
        });

        if (!priceCalculation.success) {
          console.error(`❌ Price calculation failed for ${product.name}:`, priceCalculation.error);
          updateResults.push({
            productId: product._id.toString(),
            name: product.name,
            metalType: product.metalType,
            error: priceCalculation.error || 'Price calculation failed',
            success: false
          });
          errorCount++;
          continue;
        }

        const newMRP = priceCalculation.breakdown.finalPrice;
        const oldMRP = product.mrp || 0;
        const oldSellingPrice = product.sellingPrice || product.price || 0;

        // Validate the new MRP
        if (!newMRP || newMRP <= 0) {
          console.error(`❌ Invalid MRP calculated for ${product.name}: ${newMRP}`);
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

        // Calculate new selling price using discount percentage
        const discountPercent = product.discountPercent || 0;
        const discountMultiplier = 1 - (discountPercent / 100);
        const newSellingPrice = newMRP * discountMultiplier;

        // Prepare price history entry
        const priceHistoryEntry = {
          date: new Date(),
          goldPrice: currentGoldPrice,
          silverPrice: currentSilverPrice,
          calculatedPrice: newMRP,
          finalPrice: newSellingPrice
        };

        if (!dryRun) {
          // Update product prices in database
          await Product.findByIdAndUpdate(product._id, {
            mrp: newMRP,
            sellingPrice: newSellingPrice,
            price: newSellingPrice, // For backward compatibility
            // Don't update costPrice - it's manually entered by admin
            // Don't update discountPercent - it's manually set by admin
            lastPriceUpdate: new Date(),
            goldPriceAtUpdate: currentGoldPrice,
            $push: {
              priceHistory: priceHistoryEntry
            }
          });
        }

        console.log(`✅ ${dryRun ? '[DRY RUN] ' : ''}Updated ${product.name}: MRP ₹${oldMRP.toFixed(2)} → ₹${newMRP.toFixed(2)}, Selling ₹${oldSellingPrice.toFixed(2)} → ₹${newSellingPrice.toFixed(2)}`);

        updateResults.push({
          productId: product._id.toString(),
          name: product.name,
          sku: product.sku,
          metalType: product.metalType,
          specifications: {
            goldWeight: product.goldWeight,
            goldPurity: product.goldPurity,
            silverWeight: product.silverWeight,
            silverPurity: product.silverPurity
          },
          oldMRP: parseFloat(oldMRP.toFixed(2)),
          newMRP: parseFloat(newMRP.toFixed(2)),
          oldSellingPrice: parseFloat(oldSellingPrice.toFixed(2)),
          newSellingPrice: parseFloat(newSellingPrice.toFixed(2)),
          discountPercent: parseFloat(discountPercent.toFixed(2)),
          mrpChange: parseFloat((newMRP - oldMRP).toFixed(2)),
          mrpChangePercent: oldMRP > 0 ? parseFloat(((newMRP - oldMRP) / oldMRP * 100).toFixed(2)) : 0,
          sellingPriceChange: parseFloat((newSellingPrice - oldSellingPrice).toFixed(2)),
          sellingPriceChangePercent: oldSellingPrice > 0 ? parseFloat(((newSellingPrice - oldSellingPrice) / oldSellingPrice * 100).toFixed(2)) : 0,
          success: true
        });

        successCount++;
      } catch (error) {
        console.error(`❌ Error updating product ${product._id}:`, error);
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

    console.log(`✅ Price update ${dryRun ? 'simulation ' : ''}completed: ${successCount} success, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      message: dryRun 
        ? `Simulation: Would update ${successCount} products successfully`
        : `Updated ${successCount} products successfully`,
      dryRun,
      updated: successCount,
      errors: errorCount,
      currentGoldPrice: parseFloat(currentGoldPrice.toFixed(2)),
      currentSilverPrice: parseFloat(currentSilverPrice.toFixed(2)),
      priceSource: goldPriceResult.source,
      fallback: goldPriceResult.fallback || false,
      details: updateResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Bulk price update error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Failed to update product prices'
    }, { status: 500 });
  }
}

/**
 * GET endpoint to preview price changes without updating
 */
export async function GET(request) {
  try {
    // Verify admin authentication
    const authError = await adminAuth(request);
    if (authError) {
      return authError;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency') || 'INR';

    // Get current prices
    const goldPriceResult = await fetchLiveGoldPrice(currency);
    
    if (!goldPriceResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch current metal prices'
      }, { status: 500 });
    }

    // Count products with dynamic pricing
    const dynamicPricingCount = await Product.countDocuments({
      $or: [
        { pricingMethod: 'dynamic' },
        { isDynamicPricing: true }
      ]
    });

    return NextResponse.json({
      success: true,
      currentPrices: {
        gold: goldPriceResult.perGram.gold,
        silver: goldPriceResult.perGram.silver,
        currency: currency,
        source: goldPriceResult.source,
        lastUpdated: goldPriceResult.lastUpdated
      },
      productsAffected: dynamicPricingCount,
      message: `${dynamicPricingCount} products will be updated`,
      endpoint: 'POST to this URL with { "dryRun": true } to simulate updates'
    });

  } catch (error) {
    console.error('Price preview error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
