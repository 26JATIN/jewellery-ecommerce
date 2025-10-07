import { calculateJewelryPrice } from '../lib/goldPrice.js';

console.log('🧪 Testing price calculation structure...\n');

// Test the price calculation to see the response structure
const priceTest = await calculateJewelryPrice({
  goldWeight: 5.5,
  goldPurity: 22,
  makingChargePercent: 15,
  gstPercent: 3,
  currency: 'INR'
});

console.log('📊 Price calculation result structure:');
console.log(JSON.stringify(priceTest, null, 2));

if (priceTest.success) {
  console.log('\n✅ Final price available at:', 'priceCalculation.breakdown.finalPrice');
  console.log('💰 Final price value:', priceTest.breakdown.finalPrice);
} else {
  console.log('\n❌ Price calculation failed:', priceTest.error);
}