import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test platinum price calculation
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/platinum-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platinumWeight: 5, // 5 grams
        platinumPurity: 950, // 95% pure platinum
        makingChargePercent: 10,
        gstPercent: 3,
        currency: 'INR'
      })
    });

    const result = await response.json();

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        testParams: {
          platinumWeight: 5,
          platinumPurity: 950,
          makingChargePercent: 10,
          gstPercent: 3
        }
      });
    }

    // Get current platinum price per gram
    const priceResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/platinum-price`);
    const priceData = await priceResponse.json();

    return NextResponse.json({
      success: true,
      testParams: {
        platinumWeight: '5 grams',
        platinumPurity: '950 (95% pure)',
        makingChargePercent: '10%',
        gstPercent: '3%'
      },
      marketData: {
        platinumPricePerGram: priceData.data?.perGram?.platinum,
        formatted: priceData.data?.formatted?.platinum,
        source: priceData.data?.source,
        fallback: priceData.data?.fallback,
        timestamp: priceData.data?.timestamp
      },
      calculation: result.data,
      validation: {
        expectedRange: '₹20,000 - ₹30,000',
        actualPrice: result.data?.breakdown?.finalPrice,
        status: result.data?.breakdown?.finalPrice > 20000 && result.data?.breakdown?.finalPrice < 30000 ? '✓ REALISTIC' : '⚠ CHECK PRICING'
      }
    });

  } catch (error) {
    console.error('Test platinum pricing error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}