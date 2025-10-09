import { fetchLiveGoldPrice, calculatePlatinumJewelryPrice, getCachedGoldPrice } from '@/lib/goldPrice';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency') || 'INR';
    const useCache = searchParams.get('cache') === 'true';
    
    let priceData;
    
    if (useCache) {
      priceData = getCachedGoldPrice(); // This cache includes platinum prices too
      if (!priceData) {
        priceData = await fetchLiveGoldPrice(currency);
      }
    } else {
      priceData = await fetchLiveGoldPrice(currency);
    }
    
    if (!priceData.success) {
      return NextResponse.json(
        { error: 'Failed to fetch platinum price data' },
        { status: 500 }
      );
    }
    
    // Extract platinum-specific data
    const platinumData = {
      success: true,
      base: priceData.base,
      timestamp: priceData.timestamp,
      lastUpdated: priceData.lastUpdated,
      source: priceData.source,
      fallback: priceData.fallback,
      warning: priceData.warning,
      rates: {
        platinum: priceData.rates.platinum
      },
      perGram: {
        platinum: priceData.perGram.platinum
      },
      formatted: priceData.formatted ? {
        platinum: priceData.formatted.platinum
      } : undefined
    };
    
    return NextResponse.json({
      success: true,
      data: platinumData,
      cached: useCache && getCachedGoldPrice() !== null
    });
    
  } catch (error) {
    console.error('Platinum price API error:', error);
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
      platinumWeight,
      platinumPurity = 950,
      makingChargePercent = 10,
      gstPercent = 3,
      currency = 'INR'
    } = body;
    
    if (!platinumWeight || platinumWeight <= 0) {
      return NextResponse.json(
        { error: 'Valid platinum weight is required' },
        { status: 400 }
      );
    }
    
    const calculation = await calculatePlatinumJewelryPrice({
      platinumWeight,
      platinumPurity,
      makingChargePercent,
      gstPercent,
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
    console.error('Platinum jewelry price calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}