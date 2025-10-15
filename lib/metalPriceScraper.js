/**
 * Advanced Metal Price Scraper
 * Scrapes GOLD and SILVER prices from https://bullions.co.in/
 * Uses axios + JSDOM for dynamic content + Gemini AI for data extraction
 * Uses Gemini AI ONLY for JSON formatting - NOT for price generation
 */

import axios from 'axios';
import { JSDOM } from 'jsdom';
import { GoogleGenerativeAI } from '@google/generative-ai';

const BULLIONS_URL = 'https://bullions.co.in/';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// In-memory cache to reduce scraping calls
let priceCache = {
  data: null,
  timestamp: null
};

/**
 * Initialize Gemini AI
 */
function initGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  GEMINI_API_KEY not found - using basic extraction fallback');
    return null;
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  } catch (error) {
    console.warn('⚠️  Failed to initialize Gemini AI:', error.message);
    return null;
  }
}

/**
 * Scrape metal prices from bullions.co.in using axios + JSDOM
 * @returns {Promise<Object>} Scraped data with prices
 */
async function scrapeBullionsPrices() {
  try {
    console.log('🌐 Fetching content from:', BULLIONS_URL);
    
    // Fetch the page with realistic headers
    const response = await axios.get(BULLIONS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      },
      timeout: 15000
    });

    console.log('✅ Page fetched successfully, parsing with JSDOM...');
    
    // Parse with JSDOM to execute some JavaScript
    const dom = new JSDOM(response.data, {
      url: BULLIONS_URL,
      runScripts: 'dangerously', // Execute inline scripts
      resources: 'usable',
      pretendToBeVisual: true
    });
    
    const { document } = dom.window;
    
    // Wait a bit for any inline scripts to execute
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract all data from the page
    const tables = [];
    document.querySelectorAll('table').forEach(table => {
      const rows = [];
      table.querySelectorAll('tr').forEach(row => {
        const cells = [];
        row.querySelectorAll('td, th').forEach(cell => {
          cells.push(cell.textContent.trim());
        });
        if (cells.length > 0) {
          rows.push(cells.join(' | '));
        }
      });
      if (rows.length > 0) {
        tables.push(rows.join('\n'));
      }
    });
    
    // Get price elements
    const priceElements = [];
    const selectors = [
      '[class*="price"]', '[class*="rate"]', '[class*="gold"]', 
      '[class*="silver"]', '.price', '.rate', '[id*="price"]',
      '[id*="gold"]', '[id*="silver"]', 'span', 'div'
    ];
    
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(elem => {
        const text = elem.textContent.trim();
        if (text && text.match(/\d{2,6}/) && text.length < 200) {
          priceElements.push(text);
        }
      });
    });
    
    const scrapedData = {
      tables: tables.join('\n\n'),
      priceElements: [...new Set(priceElements)].join('\n'), // Remove duplicates
      bodyText: document.body.textContent.substring(0, 10000),
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Successfully parsed content');
    
    // Close the JSDOM window
    dom.window.close();
    
    return scrapedData;
    
  } catch (error) {
    console.error('❌ Error scraping bullions.co.in:', error.message);
    throw error;
  }
}

/**
 * Format scraped data into JSON using Gemini AI or regex fallback
 * IMPORTANT: Gemini ONLY formats the data, it does NOT generate prices
 * @param {Object} scrapedData - Raw scraped data from website
 * @returns {Promise<Object>} Structured JSON with ONLY gold and silver prices
 */
async function formatDataWithGemini(scrapedData) {
  const model = initGeminiAI();
  
  // If Gemini is not available, use basic regex extraction
  if (!model) {
    console.log('⚙️  Using regex extraction (Gemini API not available)');
    return extractPricesWithRegex(scrapedData);
  }
  
  try {
    const prompt = `You are a data formatting assistant. Your task is to extract ONLY GOLD and SILVER prices that are ALREADY PRESENT in the scraped data below from bullions.co.in website.

CRITICAL RULES:
1. Extract ONLY prices that are EXPLICITLY STATED in the data
2. DO NOT calculate, estimate, or generate ANY prices
3. DO NOT include platinum, palladium, or any other metals
4. If you cannot find a price in the data, DO NOT include that field
5. Return ONLY prices in INR per gram
6. Convert units if needed:
   - If price is per 10 grams, divide by 10
   - If price is per kg, divide by 1000
   - If price is per tola (11.66 grams), divide by 11.66
   - If price is per ounce (31.1 grams), divide by 31.1

Scraped data from bullions.co.in:
${JSON.stringify(scrapedData, null, 2)}

Return ONLY a valid JSON object with this structure (omit any fields you cannot find):
{
  "gold": {
    "24k": <number - price per gram in INR>,
    "22k": <number - price per gram in INR>,
    "18k": <number - price per gram in INR>
  },
  "silver": {
    "perGram": <number - price per gram in INR>
  }
}

Return ONLY the JSON object, no markdown formatting, no explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up markdown formatting if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('🤖 Gemini AI formatted the data');
    
    try {
      const formattedData = JSON.parse(text);
      
      // Validate that we got actual prices
      if (!formattedData.gold && !formattedData.silver) {
        console.warn('⚠️  Gemini returned no prices, using regex fallback');
        return extractPricesWithRegex(scrapedData);
      }
      
      return {
        gold: formattedData.gold || {},
        silver: formattedData.silver || {},
        timestamp: new Date().toISOString(),
        source: 'Bullions.co.in (Gemini formatted)'
      };
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response, using regex fallback');
      return extractPricesWithRegex(scrapedData);
    }
  } catch (error) {
    console.error('❌ Error with Gemini AI, using regex fallback:', error.message);
    return extractPricesWithRegex(scrapedData);
  }
}

/**
 * Fallback: Extract prices using regex patterns
 * @param {Object} scrapedData - Raw scraped data
 * @returns {Object} Extracted price data for gold and silver only
 */
function extractPricesWithRegex(scrapedData) {
  const allText = `${scrapedData.tables} ${scrapedData.priceElements} ${scrapedData.bodyText}`;
  
  console.log('🔍 Extracting prices with regex...');
  
  // Enhanced patterns for bullions.co.in table format
  // Looking for: "Gold 24 Karat (Rs ₹) | 12,733 | ..." (first column after label)
  const gold24kPatterns = [
    /Gold\s+24\s+Karat[^\d]*?(\d{1,2},?\d{3})\s*\|/i,  // Table format with pipe
    /Gold\s+24\s+Karat[^\d]*?(?:Rs\.?|₹)\s*(\d{1,2},?\d{3})/i,  // Text format
    /24K?[^0-9]{0,20}?(?:Rs\.?|₹)?\s*(\d{1,2},?\d{3})/i
  ];
  
  const gold22kPatterns = [
    /Gold\s+22\s+Karat[^\d]*?(\d{1,2},?\d{3})\s*\|/i,
    /Gold\s+22\s+Karat[^\d]*?(?:Rs\.?|₹)\s*(\d{1,2},?\d{3})/i,
    /22K?[^0-9]{0,20}?(?:Rs\.?|₹)?\s*(\d{1,2},?\d{3})/i
  ];
  
  const gold18kPatterns = [
    /Gold\s+18\s+Karat[^\d]*?(\d{1,2},?\d{3})\s*\|/i,
    /Gold\s+18\s+Karat[^\d]*?(?:Rs\.?|₹)\s*(\d{1,2},?\d{3})/i,
    /18K?[^0-9]{0,20}?(?:Rs\.?|₹)?\s*(\d{1,2},?\d{3})/i
  ];
  
  const silverPatterns = [
    /Silver\s+999[^\d]*?(\d{2,3})\s*\|/i,  // Table format
    /Silver\s+999[^\d]*?(?:Rs\.?|₹)\s*(\d{2,3})/i,
    /Silver.*?999[^0-9]*?(?:Rs\.?|₹)?\s*(\d{2,3})/i
  ];
  
  let gold24k = null;
  let gold22k = null;
  let gold18k = null;
  let silver = null;
  
  // Try each pattern until we find a match
  for (const pattern of gold24kPatterns) {
    const match = allText.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1].replace(/,/g, ''));
      // Sanity check: per gram gold price should be between 3000-20000
      if (value >= 3000 && value <= 20000) {
        gold24k = value;
        console.log(`  ✓ Found 24K gold: ₹${gold24k}/gram`);
        break;
      }
    }
  }
  
  for (const pattern of gold22kPatterns) {
    const match = allText.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1].replace(/,/g, ''));
      if (value >= 3000 && value <= 20000) {
        gold22k = value;
        console.log(`  ✓ Found 22K gold: ₹${gold22k}/gram`);
        break;
      }
    }
  }
  
  for (const pattern of gold18kPatterns) {
    const match = allText.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1].replace(/,/g, ''));
      if (value >= 2000 && value <= 20000) {
        gold18k = value;
        console.log(`  ✓ Found 18K gold: ₹${gold18k}/gram`);
        break;
      }
    }
  }
  
  for (const pattern of silverPatterns) {
    const match = allText.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1].replace(/,/g, ''));
      // Sanity check: per gram silver price should be between 50-500
      if (value >= 50 && value <= 500) {
        silver = value;
        console.log(`  ✓ Found silver 999: ₹${silver}/gram`);
        break;
      }
    }
  }
  
  const result = {
    gold: {},
    silver: {},
    timestamp: new Date().toISOString(),
    source: 'Bullions.co.in (Regex extraction)'
  };
  
  if (gold24k) result.gold['24k'] = gold24k;
  if (gold22k) result.gold['22k'] = gold22k;
  if (gold18k) result.gold['18k'] = gold18k;
  if (silver) result.silver.perGram = silver;
  
  console.log('✅ Regex extraction completed');
  return result;
}

/**
 * Fetch live GOLD and SILVER prices from Bullions.co.in
 * @param {string} currency - Target currency (only INR supported)
 * @returns {Promise<Object>} Structured metal price data
 */
export async function fetchLiveMetalPrices(currency = 'INR') {
  try {
    // Check cache first
    if (priceCache.data && priceCache.timestamp) {
      const cacheAge = Date.now() - priceCache.timestamp;
      if (cacheAge < CACHE_DURATION) {
        console.log('📦 Returning cached metal price data');
        return priceCache.data;
      }
    }

    // Only support INR since Bullions.co.in is Indian market
    if (currency !== 'INR') {
      console.warn(`⚠️  Currency ${currency} not supported, using INR`);
      currency = 'INR';
    }

    // Step 1: Scrape Bullions.co.in website with Puppeteer
    const scrapedData = await scrapeBullionsPrices();
    
    // Step 2: Format data using Gemini AI (or regex fallback)
    const cleanedData = await formatDataWithGemini(scrapedData);
    
    // Step 3: Build final response with ONLY gold and silver
    const structuredData = {
      success: true,
      base: currency,
      timestamp: Math.floor(Date.now() / 1000),
      lastUpdated: cleanedData.timestamp,
      source: cleanedData.source,
      rates: {
        gold: cleanedData.gold['24k'] || cleanedData.gold['22k'] || 0,
        silver: cleanedData.silver.perGram || 0
      },
      perGram: {
        gold: cleanedData.gold['24k'] || cleanedData.gold['22k'] || 0,
        silver: cleanedData.silver.perGram || 0
      },
      detailed: {
        gold: {
          '24k': cleanedData.gold['24k'] || null,
          '22k': cleanedData.gold['22k'] || null,
          '18k': cleanedData.gold['18k'] || null
        },
        silver: {
          perGram: cleanedData.silver.perGram || null
        }
      }
    };

    // Update cache
    priceCache = {
      data: structuredData,
      timestamp: Date.now()
    };

    console.log('✅ Successfully fetched and formatted Bullions.co.in rates');
    return structuredData;

  } catch (error) {
    console.error('❌ Error fetching live metal prices:', error);
    console.warn('⚠️  Falling back to static prices');
    return getFallbackMetalPrices(currency);
  }
}

/**
 * Fallback prices when scraping fails (ONLY gold and silver)
 * @param {string} currency 
 * @returns {Object} Fallback price data
 */
function getFallbackMetalPrices(currency = 'INR') {
  console.log('⚠️  Using fallback prices');
  
  return {
    success: true,
    base: currency,
    timestamp: Math.floor(Date.now() / 1000),
    lastUpdated: new Date().toISOString(),
    fallback: true,
    source: 'Fallback Data',
    warning: 'Using fallback prices - Scraper unavailable',
    rates: {
      gold: 7200, // INR per gram
      silver: 95  // INR per gram
    },
    perGram: {
      gold: 7200,
      silver: 95
    },
    detailed: {
      gold: {
        '24k': 7200,
        '22k': 6600,
        '18k': 5400
      },
      silver: {
        perGram: 95
      }
    }
  };
}

/**
 * Get cached metal price data without scraping
 * @returns {Object|null} Cached price data or null if not available
 */
export function getCachedMetalPrice() {
  if (priceCache.data && priceCache.timestamp) {
    const cacheAge = Date.now() - priceCache.timestamp;
    if (cacheAge < CACHE_DURATION) {
      return priceCache.data;
    }
  }
  return null;
}

/**
 * Clear price cache
 */
export function clearPriceCache() {
  priceCache = {
    data: null,
    timestamp: null
  };
  console.log('🗑️  Price cache cleared');
}

// Default export
export default {
  fetchLiveMetalPrices,
  getCachedMetalPrice,
  clearPriceCache
};
