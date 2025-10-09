import { fetchLiveGoldPrice, calculateSilverJewelryPrice, getCachedGoldPrice } from '@/lib/goldPrice';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency') || 'INR';
    const useCache = searchParams.get('cache') === 'true';
    
    let priceData;
    
    if (useCache) {
      priceData = getCachedGoldPrice(); // This cache includes silver prices too
      if (!priceData) {
        priceData = await fetchLiveGoldPrice(currency);
      }
    } else {
      priceData = await fetchLiveGoldPrice(currency);
    }
    
    if (!priceData.success) {
      return NextResponse.json(
        { error: 'Failed to fetch silver price data' },
        { status: 500 }
      );
    }
    
    // Extract silver-specific data
    const silverData = {
      success: true,
      base: priceData.base,
      timestamp: priceData.timestamp,
      lastUpdated: priceData.lastUpdated,
      source: priceData.source,
      fallback: priceData.fallback,
      warning: priceData.warning,
      rates: {
        silver: priceData.rates.silver
      },
      perGram: {
        silver: priceData.perGram.silver
      },
      formatted: priceData.formatted ? {
        silver: priceData.formatted.silver
      } : undefined
    };
    
    return NextResponse.json({
      success: true,
      data: silverData,
      cached: useCache && getCachedGoldPrice() !== null
    });
    
  } catch (error) {
    console.error('Silver price API error:', error);
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
      silverWeight,
      silverPurity = 925,
      makingChargePercent = 20,
      gstPercent = 3,
      currency = 'INR'
    } = body;
    
    if (!silverWeight || silverWeight <= 0) {
      return NextResponse.json(
        { error: 'Valid silver weight is required' },
        { status: 400 }
      );
    }
    
    const calculation = await calculateSilverJewelryPrice({
      silverWeight,
      silverPurity,
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
    console.error('Silver jewelry price calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}