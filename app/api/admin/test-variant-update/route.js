import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

/**
 * Test endpoint to verify variant price adjustment logic
 */
export async function GET(request) {
  try {
    await connectDB();
    
    // Find a product with variants
    const product = await Product.findOne({ 
      hasVariants: true,
      'variants.0': { $exists: true }
    });

    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'No product with variants found in database'
      });
    }

    // Calculate adjustments for each variant
    const variantAnalysis = product.variants.map((variant, index) => {
      let totalAdjustment = 0;
      const adjustmentDetails = [];

      if (variant.optionCombination && product.variantOptions) {
        Object.entries(variant.optionCombination).forEach(([optionName, valueName]) => {
          const option = product.variantOptions.find(opt => opt.name === optionName);
          if (option && option.values) {
            const value = option.values.find(v => v.name === valueName);
            if (value) {
              const adjustment = parseFloat(value.priceAdjustment) || 0;
              totalAdjustment += adjustment;
              adjustmentDetails.push({
                option: optionName,
                value: valueName,
                adjustment: adjustment
              });
            }
          }
        });
      }

      return {
        index,
        sku: variant.sku,
        combination: variant.optionCombination,
        currentPrices: variant.price,
        adjustmentDetails,
        totalAdjustment,
        calculatedMRP: (product.mrp || 0) + totalAdjustment,
        calculatedSelling: (product.sellingPrice || 0) + totalAdjustment
      };
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        basePrices: {
          mrp: product.mrp,
          sellingPrice: product.sellingPrice
        },
        hasVariants: product.hasVariants,
        variantOptionsCount: product.variantOptions?.length || 0,
        variantOptions: product.variantOptions,
        variantsCount: product.variants?.length || 0
      },
      variantAnalysis
    });

  } catch (error) {
    console.error('Test variant update error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
