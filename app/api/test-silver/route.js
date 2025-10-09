import { fetchLiveGoldPrice, calculateSilverJewelryPrice } from '@/lib/goldPrice';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== SILVER PRICING TEST ===');
    
    // Test 1: Fetch live silver price
    const priceData = await fetchLiveGoldPrice('INR');
    console.log('Silver price per gram:', priceData.perGram.silver);
    console.log('Silver price per ounce:', priceData.rates.silver);
    
    // Test 2: Calculate 10g silver jewelry price
    const calculation = await calculateSilverJewelryPrice({
      silverWeight: 10,
      silverPurity: 925,
      makingChargePercent: 20,
      gstPercent: 3,
      currency: 'INR'
    });
    
    console.log('=== 10g Silver Calculation ===');
    console.log('Silver value:', calculation.breakdown.pureSilverValue);
    console.log('Making charges:', calculation.breakdown.makingCharges);
    console.log('Final price:', calculation.breakdown.finalPrice);
    
    // Test 3: Verify math
    const expectedSilverValue = 10 * priceData.perGram.silver * (925/1000);
    console.log('Expected silver value (manual):', expectedSilverValue);
    
    return NextResponse.json({
      success: true,
      tests: {
        silverPricePerGram: priceData.perGram.silver,
        silverPricePerOunce: priceData.rates.silver,
        tenGramCalculation: calculation.breakdown,
        expectedSilverValue,
        priceSource: priceData.source,
        currency: 'INR'
      }
    });
    
  } catch (error) {
    console.error('Silver pricing test error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}