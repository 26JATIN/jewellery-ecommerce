// Test script for Gold Price API
// Run with: node scripts/testGoldApi.js

import { fetchLiveGoldPrice, calculateJewelryPrice, clearPriceCache } from '../lib/goldPrice.js';

async function testGoldPriceAPI() {
    console.log('🧪 Testing Gold Price API...\n');
    
    // Clear cache to get fresh data
    clearPriceCache();
    console.log('🔄 Cleared price cache\n');
    
    try {
        // Test 1: Fetch live gold price
        console.log('📊 Fetching live gold prices...');
        const goldData = await fetchLiveGoldPrice('INR');
        
        if (goldData.success) {
            console.log('✅ Gold price fetch successful!');
            console.log(`💰 24K Gold price: ₹${goldData.perGram.gold.toFixed(2)}/gram`);
            console.log(`💰 22K Gold price: ₹${(goldData.perGram.gold * (22/24)).toFixed(2)}/gram`);
            console.log(`⏰ Last updated: ${goldData.lastUpdated}`);
            console.log(`🔄 Using fallback: ${goldData.fallback ? 'Yes' : 'No'}`);
            console.log(`📊 Source: ${goldData.source}\n`);
        } else {
            console.log('❌ Gold price fetch failed');
            return;
        }

        // Test 2: Calculate jewelry price
        console.log('🧮 Testing jewelry price calculation...');
        // Test with 1 gram for easy verification
        const calculation1g = await calculateJewelryPrice({
            goldWeight: 1, // 1 gram
            goldPurity: 24,  // 24K gold
            makingChargePercent: 0, // No making charges for direct comparison
            gstPercent: 0, // No GST for direct comparison
            currency: 'INR'
        });

        console.log('🧮 Testing 1 gram 24K gold (no charges)...');
        if (calculation1g.success) {
            console.log(`📏 Gold weight: ${calculation1g.breakdown.goldWeight}g`);
            console.log(`🏆 Gold purity: ${calculation1g.breakdown.goldPurity}K`);
            console.log(`💎 Pure gold value: ₹${calculation1g.breakdown.pureGoldValue}`);
            console.log(`💰 Final price: ₹${calculation1g.breakdown.finalPrice}\n`);
        }

        // Test with 1 gram 22K gold
        const calculation1g22k = await calculateJewelryPrice({
            goldWeight: 1, // 1 gram
            goldPurity: 22,  // 22K gold
            makingChargePercent: 0, // No making charges for direct comparison
            gstPercent: 0, // No GST for direct comparison
            currency: 'INR'
        });

        console.log('🧮 Testing 1 gram 22K gold (no charges)...');
        if (calculation1g22k.success) {
            console.log(`📏 Gold weight: ${calculation1g22k.breakdown.goldWeight}g`);
            console.log(`🏆 Gold purity: ${calculation1g22k.breakdown.goldPurity}K`);
            console.log(`💎 Pure gold value: ₹${calculation1g22k.breakdown.pureGoldValue}`);
            console.log(`💰 Final price: ₹${calculation1g22k.breakdown.finalPrice}\n`);
        }

        // Test with jewelry (5.5g with charges)
        const calculation = await calculateJewelryPrice({
            goldWeight: 5.5, // 5.5 grams
            goldPurity: 22,  // 22K gold
            makingChargePercent: 15,
            gstPercent: 3,
            currency: 'INR'
        });

        console.log('🧮 Testing jewelry with making charges and GST...');
        if (calculation.success) {
            console.log('✅ Price calculation successful!');
            console.log(`📏 Gold weight: ${calculation.breakdown.goldWeight}g`);
            console.log(`🏆 Gold purity: ${calculation.breakdown.goldPurity}K`);
            console.log(`💎 Pure gold value: ₹${calculation.breakdown.pureGoldValue}`);
            console.log(`🔨 Making charges: ₹${calculation.breakdown.makingCharges}`);
            console.log(`🏛️ GST (3%): ₹${calculation.breakdown.gstAmount}`);
            console.log(`💰 Final price: ₹${calculation.breakdown.finalPrice}`);
        } else {
            console.log('❌ Price calculation failed:', calculation.error);
        }

    } catch (error) {
        console.error('🚨 Test failed:', error.message);
    }
}

// Run the test
testGoldPriceAPI();