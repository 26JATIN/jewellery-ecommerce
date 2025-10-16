#!/usr/bin/env node
/**
 * Startup Script - Validates environment before server starts
 * Run this before starting the application
 */

import { validateEnvVariables, generateEnvExample } from '../lib/envValidation.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

console.log('\n🔍 Validating environment variables...\n');

try {
    const result = validateEnvVariables(true);
    
    if (result.valid) {
        console.log('✅ Environment validation passed!\n');
        process.exit(0);
    } else {
        console.error('❌ Environment validation failed\n');
        process.exit(1);
    }
} catch (error) {
    if (error.name === 'EnvironmentValidationError') {
        console.error('\n💡 Tip: Generate a .env.example file with:');
        console.error('   node scripts/generate-env-example.js\n');
        
        // Auto-generate .env.example if it doesn't exist
        try {
            const exampleContent = generateEnvExample();
            const envExamplePath = join(process.cwd(), '.env.example');
            writeFileSync(envExamplePath, exampleContent);
            console.log(`✅ Generated .env.example file at: ${envExamplePath}\n`);
        } catch (writeError) {
            console.error('Failed to generate .env.example:', writeError.message);
        }
        
        process.exit(1);
    } else {
        console.error('Unexpected error during validation:', error);
        process.exit(1);
    }
}
