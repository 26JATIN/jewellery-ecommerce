#!/usr/bin/env node

/**
 * Jewelry E-commerce Database Seeding Script
 * 
 * This script seeds the database with:
 * - 6 Main Categories (Rings, Necklaces, Earrings, Bracelets, Pendants, Mangalsutras)
 * - 23 Subcategories across all categories
 * - 8 Products with realistic jewelry data
 * - Multiple variants for products that need them (sizes, colors, materials)
 * 
 * Usage:
 * npm run seed-data
 * 
 * Or directly:
 * node scripts/runSeed.js
 */

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Jewelry Database Seeding Process...\n');

// Run the seed script
const seedScript = join(__dirname, 'seedJewelryData.js');
const process = exec(`node ${seedScript}`, (error, stdout, stderr) => {
    if (error) {
        console.error('❌ Seeding failed:', error);
        return;
    }
    
    if (stderr) {
        console.error('⚠️  Warnings:', stderr);
    }
    
    console.log(stdout);
});

process.stdout.on('data', (data) => {
    console.log(data.toString());
});

process.stderr.on('data', (data) => {
    console.error(data.toString());
});