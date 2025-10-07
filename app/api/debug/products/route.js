import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request) {
  try {
    await connectDB();
    
    // Get all products and their dynamic pricing status
    const allProducts = await Product.find({}, {
      name: 1,
      isDynamicPricing: 1,
      goldWeight: 1,
      goldPurity: 1,
      makingChargePercent: 1,
      price: 1,
      pricingMethod: 1
    });
    
    // Separate products by pricing type
    const dynamicProducts = allProducts.filter(p => p.isDynamicPricing === true);
    const productsWithGoldWeight = allProducts.filter(p => p.goldWeight && p.goldWeight > 0);
    const eligibleProducts = allProducts.filter(p => 
      p.isDynamicPricing === true && p.goldWeight && p.goldWeight > 0
    );
    
    return NextResponse.json({
      success: true,
      data: {
        totalProducts: allProducts.length,
        dynamicPricingProducts: dynamicProducts.length,
        productsWithGoldWeight: productsWithGoldWeight.length,
        eligibleForUpdate: eligibleProducts.length,
        allProducts: allProducts,
        eligibleProducts: eligibleProducts
      }
    });

  } catch (error) {
    console.error('Error checking products:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}