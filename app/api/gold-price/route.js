import { fetchLiveGoldPrice, calculateJewelryPrice, getCachedGoldPrice } from '@/lib/goldPrice';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency') || 'INR';
    const useCache = searchParams.get('cache') === 'true';
    
    let goldPriceData;
    
    if (useCache) {
      goldPriceData = getCachedGoldPrice();
      if (!goldPriceData) {
        goldPriceData = await fetchLiveGoldPrice(currency);
      }
    } else {
      goldPriceData = await fetchLiveGoldPrice(currency);
    }
    
    if (!goldPriceData.success) {
      return NextResponse.json(
        { error: 'Failed to fetch gold price data' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: goldPriceData,
      cached: useCache && getCachedGoldPrice() !== null
    });
    
  } catch (error) {
    console.error('Gold price API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      goldWeight = 0,
      goldPurity = 22,
      silverWeight = 0,
      silverPurity = 999,
      stoneValue = 0,
      makingChargePercent = 15,
      gstPercent = 3,
      currency = 'INR'
    } = body;
    
    // Validate that at least some weight is provided
    if ((!goldWeight || goldWeight <= 0) && (!silverWeight || silverWeight <= 0)) {
      return NextResponse.json(
        { error: 'Valid gold weight or silver weight is required' },
        { status: 400 }
      );
    }
    
    const calculation = await calculateJewelryPrice({
      goldWeight: parseFloat(goldWeight) || 0,
      goldPurity: parseInt(goldPurity),
      silverWeight: parseFloat(silverWeight) || 0,
      silverPurity: parseInt(silverPurity),
      stoneValue: parseFloat(stoneValue) || 0,
      makingChargePercent: parseFloat(makingChargePercent),
      gstPercent: parseFloat(gstPercent),
      currency
    });
    
    if (!calculation.success) {
      return NextResponse.json(
        { error: calculation.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: calculation
    });
    
  } catch (error) {
    console.error('Jewelry price calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}