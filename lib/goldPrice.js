/**
 * Gold Price Integration using IBJA Web Scraper
 * Fetches live GOLD and SILVER prices ONLY from https://ibjarates.com/
 * Uses Gemini AI for data cleaning
 * NO platinum or palladium prices
 */

import { fetchLiveMetalPrices, getCachedMetalPrice, clearPriceCache as clearScraperCache } from '@/lib/metalPriceScraper';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// In-memory cache to reduce API calls
let priceCache = {
  data: null,
  timestamp: null
};

/**
 * Fetch live gold and silver prices using IBJA scraper
 * @param {string} currency - Target currency (default: INR)
 * @returns {Promise<Object>} Gold and silver price data
 */
export async function fetchLiveGoldPrice(currency = 'INR') {
  try {
    // Check cache first
    if (priceCache.data && priceCache.timestamp) {
      const cacheAge = Date.now() - priceCache.timestamp;
      if (cacheAge < CACHE_DURATION) {
        console.log('📦 Returning cached gold/silver price data');
        return priceCache.data;
      }
    }

    // Fetch from IBJA scraper with Gemini AI cleaning
    console.log('🌐 Fetching prices from IBJA scraper...');
    const data = await fetchLiveMetalPrices(currency);
    
    if (data && data.success) {
      // Update cache
      priceCache = {
        data: data,
        timestamp: Date.now()
      };
      console.log('✅ Successfully fetched from IBJA scraper');
      return data;
    }

    // If scraper fails, use fallback
    console.warn('⚠️  IBJA scraper failed, using fallback prices');
    return getFallbackGoldPrice(currency);
  } catch (error) {
    console.error('❌ Error fetching live gold/silver price:', error);
    return getFallbackGoldPrice(currency);
  }
}

/**
 * Fallback gold and silver prices when scraper is unavailable
 * ONLY GOLD AND SILVER - No platinum or palladium
 * @param {string} currency 
 * @returns {Object} Fallback price data
 */
function getFallbackGoldPrice(currency = 'INR') {
  // Current gold and silver prices - Based on Indian market rates
  const fallbackPrices = {
    INR: {
      gold: 7200,  // ₹7,200 per gram (24K)
      silver: 95   // ₹95 per gram
    },
    USD: {
      gold: 85,    // ~$85 per gram
      silver: 1.1  // ~$1.1 per gram
    }
  };

  const rates = fallbackPrices[currency] || fallbackPrices.INR;
  const currencySymbol = {
    INR: '₹',
    USD: '$'
  }[currency] || '₹';

  return {
    success: true,
    base: currency,
    timestamp: Math.floor(Date.now() / 1000),
    lastUpdated: new Date().toISOString(),
    fallback: true,
    source: 'Fallback Data',
    warning: 'Using fallback prices - Scraper unavailable',
    rates: {
      gold: rates.gold,
      silver: rates.silver
    },
    perGram: {
      gold: rates.gold,
      silver: rates.silver
    },
    detailed: {
      gold: {
        '24k': rates.gold,
        '22k': rates.gold * (22/24),
        '18k': rates.gold * (18/24)
      },
      silver: {
        perGram: rates.silver
      }
    }
  };
}

/**
 * Calculate jewelry price based on metal prices and specifications
 * Supports ONLY gold and silver (NO platinum)
 * Gold purities: 24K, 22K, 20K, 18K
 * Silver purity: 999 only
 * @param {Object} params - Calculation parameters
 * @param {number} params.goldWeight - Weight of gold in grams
 * @param {number} params.goldPurity - Purity of gold (18, 20, 22, or 24)
 * @param {number} params.silverWeight - Weight of silver in grams
 * @param {number} params.silverPurity - Purity of silver (999 only)
 * @param {number} params.stoneValue - Fixed value of stones/gems
 * @param {number} params.makingChargePercent - Making charge percentage
 * @param {number} params.gstPercent - GST percentage (default 3% for jewelry in India)
 * @param {string} params.currency - Currency for calculation (default: INR)
 * @returns {Promise<Object>} Calculated price breakdown
 */
export async function calculateJewelryPrice({
  goldWeight = 0,
  goldPurity = 22,
  silverWeight = 0,
  silverPurity = 999,
  stoneValue = 0,
  makingChargePercent = 15,
  gstPercent = 3,
  currency = 'INR'
}) {
  try {
    const priceData = await fetchLiveGoldPrice(currency);
    
    if (!priceData.success) {
      throw new Error('Failed to fetch metal prices');
    }

    // Get prices per gram for each metal
    const goldPricePerGram = priceData.perGram.gold || 0;
    const silverPricePerGram = priceData.perGram.silver || 0;
    
    // Calculate gold value
    let goldValue = 0;
    if (goldWeight > 0) {
      const goldPurityMultiplier = goldPurity / 24;
      goldValue = goldWeight * goldPricePerGram * goldPurityMultiplier;
    }
    
    // Calculate silver value
    let silverValue = 0;
    if (silverWeight > 0) {
      const silverPurityMultiplier = silverPurity / 1000; // Silver purity is in parts per thousand
      silverValue = silverWeight * silverPricePerGram * silverPurityMultiplier;
    }
    
    // Total metal value (gold + silver only, NO platinum)
    const totalMetalValue = goldValue + silverValue;
    
    // Calculate making charges on metal value only (not on stones)
    const makingCharges = totalMetalValue * (makingChargePercent / 100);
    
    // Calculate subtotal (metal + making + stones)
    const subtotal = totalMetalValue + makingCharges + stoneValue;
    
    // Calculate GST on subtotal
    const gstAmount = subtotal * (gstPercent / 100);
    
    // Calculate final price (MRP)
    const finalPrice = subtotal + gstAmount;

    return {
      success: true,
      currency,
      goldPriceData: priceData,
      silverPriceData: priceData, // Same data source for both metals
      breakdown: {
        // Gold breakdown
        goldWeight,
        goldPurity,
        goldPricePerGram: parseFloat(goldPricePerGram.toFixed(2)),
        goldValue: parseFloat(goldValue.toFixed(2)),
        
        // Silver breakdown
        silverWeight,
        silverPurity,
        silverPricePerGram: parseFloat(silverPricePerGram.toFixed(2)),
        silverValue: parseFloat(silverValue.toFixed(2)),
        
        // Stone value
        stoneValue: parseFloat(stoneValue.toFixed(2)),
        
        // Totals
        totalMetalValue: parseFloat(totalMetalValue.toFixed(2)),
        baseMetalValue: parseFloat(totalMetalValue.toFixed(2)), // For compatibility
        makingCharges: parseFloat(makingCharges.toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2)),
        gstAmount: parseFloat(gstAmount.toFixed(2)),
        finalPrice: parseFloat(finalPrice.toFixed(2))
      },
      percentages: {
        makingCharge: makingChargePercent,
        gst: gstPercent
      },
      calculatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error calculating jewelry price:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate silver jewelry price based on silver price and specifications
 * @param {Object} params - Calculation parameters
 * @param {number} params.silverWeight - Weight of silver in grams
 * @param {number} params.silverPurity - Purity of silver (999 only)
 * @param {number} params.makingChargePercent - Making charge percentage
 * @param {number} params.gstPercent - GST percentage (default 3% for jewelry in India)
 * @param {string} params.currency - Currency for calculation (default: INR)
 * @returns {Promise<Object>} Calculated price breakdown
 */
export async function calculateSilverJewelryPrice({
  silverWeight,
  silverPurity = 999,
  makingChargePercent = 20, // Silver typically has higher making charges
  gstPercent = 3,
  currency = 'INR'
}) {
  try {
    const priceData = await fetchLiveGoldPrice(currency); // This fetches all metals including silver
    
    if (!priceData.success) {
      throw new Error('Failed to fetch silver price');
    }

    const silverPricePerGram = priceData.perGram.silver;
    
    // Calculate pure silver value based on purity
    const purityMultiplier = silverPurity / 1000; // Silver purity is in parts per thousand
    const pureSilverValue = silverWeight * silverPricePerGram * purityMultiplier;
    
    // Calculate making charges
    const makingCharges = pureSilverValue * (makingChargePercent / 100);
    
    // Calculate subtotal
    const subtotal = pureSilverValue + makingCharges;
    
    // Calculate GST
    const gstAmount = subtotal * (gstPercent / 100);
    
    // Calculate final price
    const finalPrice = subtotal + gstAmount;

    return {
      success: true,
      currency,
      silverPriceData: priceData,
      breakdown: {
        silverWeight,
        silverPurity,
        silverPricePerGram: parseFloat(silverPricePerGram.toFixed(2)),
        pureSilverValue: parseFloat(pureSilverValue.toFixed(2)),
        makingCharges: parseFloat(makingCharges.toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2)),
        gstAmount: parseFloat(gstAmount.toFixed(2)),
        finalPrice: parseFloat(finalPrice.toFixed(2))
      },
      percentages: {
        makingCharge: makingChargePercent,
        gst: gstPercent
      },
      calculatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error calculating silver jewelry price:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get cached gold price data without API call
 * @returns {Object|null} Cached price data or null if not available
 */
export function getCachedGoldPrice() {
  if (priceCache.data && priceCache.timestamp) {
    const cacheAge = Date.now() - priceCache.timestamp;
    if (cacheAge < CACHE_DURATION) {
      return priceCache.data;
    }
  }
  return null;
}

/**
 * Clear price cache (useful for testing or forced refresh)
 */
export function clearPriceCache() {
  priceCache = {
    data: null,
    timestamp: null
  };
  clearScraperCache();
}
