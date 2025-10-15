/**
 * Test script for IBJA metal price scraper
 * Tests scraping ONLY gold and silver prices from ibjarates.com
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Import the scraper
import { fetchLiveMetalPrices } from '../lib/metalPriceScraper.js';

async function testScraper() {
  console.log('='.repeat(60));
  console.log('🧪 Testing IBJA Metal Price Scraper (Gold & Silver Only)');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    console.log('⏳ Fetching live gold and silver prices from IBJA...');
    console.log('');
    
    const prices = await fetchLiveMetalPrices('INR');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS! Metal Prices Retrieved:');
    console.log('='.repeat(60));
    console.log('');
    console.log('📊 Overview:');
    console.log(`   Source: ${prices.source}`);
    console.log(`   Last Updated: ${prices.lastUpdated}`);
    console.log(`   Fallback: ${prices.fallback || false}`);
    console.log('');
    console.log('💰 Gold Prices (per gram):');
    console.log(`   24K: ₹${prices.detailed.gold['24k'] || 'N/A'}`);
    console.log(`   22K: ₹${prices.detailed.gold['22k'] || 'N/A'}`);
    console.log(`   18K: ₹${prices.detailed.gold['18k'] || 'N/A'}`);
    console.log('');
    console.log('🥈 Silver Price (per gram):');
    console.log(`   999: ₹${prices.detailed.silver.perGram || 'N/A'}`);
    console.log('');
    console.log('� Full JSON Response:');
    console.log(JSON.stringify(prices, null, 2));
    
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ ERROR:');
    console.error('='.repeat(60));
    console.error(error.message);
    console.error(error.stack);
  }
}

testScraper();
