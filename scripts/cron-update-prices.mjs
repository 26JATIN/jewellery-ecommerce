#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

dotenv.config({ path: join(projectRoot, '.env') });
dotenv.config({ path: join(projectRoot, '.env.local') });

async function updateProductPrices() {
  try {
    console.log('🔄 Starting product price update cron job...');
    console.log('⏰ Time:', new Date().toISOString());
    
    // Determine the base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    'http://localhost:3000';
    
    const cronSecret = process.env.CRON_SECRET || '';
    
    console.log(`📡 Calling API endpoint: ${baseUrl}/api/cron/update-prices`);
    
    // Call the cron endpoint
    const response = await fetch(`${baseUrl}/api/cron/update-prices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cronSecret && { 'Authorization': `Bearer ${cronSecret}` })
      }
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Price update successful!');
      console.log(`📊 Updated: ${result.updated} products`);
      console.log(`❌ Errors: ${result.errors || 0}`);
      console.log(`💰 Current Gold: ₹${result.currentPrices?.gold}/g`);
      console.log(`💰 Current Silver: ₹${result.currentPrices?.silver}/g`);
      
      if (result.updates && result.updates.length > 0) {
        console.log('\n📝 Sample updates:');
        result.updates.slice(0, 5).forEach(update => {
          console.log(`  • ${update.name}: ₹${update.oldSellingPrice.toFixed(2)} → ₹${update.newSellingPrice.toFixed(2)} (${update.sellingPriceChange >= 0 ? '+' : ''}₹${update.sellingPriceChange.toFixed(2)})`);
        });
      }
      
      process.exit(0);
    } else {
      console.error('❌ Price update failed:', result.error || result.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Cron job error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the update
updateProductPrices();
